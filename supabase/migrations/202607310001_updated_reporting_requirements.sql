-- Aktualisierte Meldeanforderungen: Zeitspannen, Pflichtkontakt,
-- Mehrfachmedien, Straßenopfer und eigenständige Straßenabschnitte.

drop view if exists public.published_sightings;

-- Das veröffentlichte Enum wird ersetzt, damit alte Werte sauber auf die
-- neue Taxonomie migriert werden können, ohne bestehende Zeilen zu verlieren.
create type public.habitat_type_v2 as enum (
  'settlement', 'settlement_edge', 'private_garden', 'public_park',
  'agricultural_area', 'orchard', 'vineyard', 'meadow_or_pasture',
  'forest', 'forest_edge_or_hedge', 'wetland_or_water_edge',
  'road_outside_settlement', 'parking_area', 'industrial_area', 'other', 'unknown'
);

alter table public.sightings alter column habitat drop default;
alter table public.sightings
  alter column habitat type public.habitat_type_v2
  using (
    case habitat::text
      when 'road' then 'road_outside_settlement'
      when 'meadow' then 'meadow_or_pasture'
      when 'forest_edge' then 'forest_edge_or_hedge'
      when 'water_edge' then 'wetland_or_water_edge'
      else habitat::text
    end
  )::public.habitat_type_v2;
drop type public.habitat_type;
alter type public.habitat_type_v2 rename to habitat_type;
alter table public.sightings alter column habitat set default 'unknown'::public.habitat_type;

alter table public.sightings drop constraint if exists sightings_time_accuracy_check;
update public.sightings set time_accuracy = 'exact' where time_accuracy = 'approximate';
alter table public.sightings
  add constraint sightings_time_accuracy_check check (time_accuracy in ('exact', 'range', 'date_only'));

alter table public.sightings
  add column observed_date date,
  add column observed_time_from time,
  add column observed_time_to time,
  add column address_or_place text check (char_length(address_or_place) <= 240),
  add column age_class text not null default 'unknown' check (age_class in ('adult', 'young_of_year', 'unknown')),
  add column sex text not null default 'unknown' check (sex in ('female', 'male', 'unknown')),
  add column animal_vital_status text not null default 'unknown' check (animal_vital_status in ('alive', 'dead', 'unknown')),
  add column behavior_other text check (char_length(behavior_other) <= 300),
  add column road_name text check (char_length(road_name) <= 160),
  add column road_position text check (road_position in ('carriageway', 'roadside', 'embankment', 'unknown')),
  add column artificial_lighting_nearby boolean,
  add column dog_or_cat_nearby boolean,
  add column privacy_notice_consent boolean not null default false;

update public.sightings
set
  observed_date = (observed_at at time zone 'Europe/Rome')::date,
  observed_time_from = case when time_accuracy = 'date_only' then null else (observed_at at time zone 'Europe/Rome')::time end,
  animal_vital_status = case observation_type::text when 'alive' then 'alive' when 'injured' then 'alive' when 'dead' then 'dead' else 'unknown' end,
  privacy_notice_consent = true;

alter table public.sightings alter column observed_date set not null;
alter table public.sightings
  add constraint sightings_time_values_check check (
    (time_accuracy = 'date_only' and observed_time_from is null and observed_time_to is null)
    or (time_accuracy = 'exact' and observed_time_from is not null and observed_time_to is null)
    or (time_accuracy = 'range' and observed_time_from is not null and observed_time_to is not null and observed_time_to >= observed_time_from)
  ),
  add constraint sightings_roadkill_fields_check check (not roadkill or (observation_type = 'dead' and road_name is not null)) not valid;

alter table public.reporter_contacts
  add column reporter_first_name text,
  add column reporter_last_name text,
  add column reporter_phone text,
  add column preferred_contact text check (preferred_contact in ('email', 'phone', 'either'));

-- Bestandsnamen bleiben vollständig erhalten. Sie werden nur dann getrennt,
-- wenn ein eindeutiges letztes Leerzeichen vorhanden ist.
update public.reporter_contacts
set
  reporter_first_name = case when position(' ' in trim(reporter_name)) > 0 then regexp_replace(trim(reporter_name), '\s+\S+$', '') else reporter_name end,
  reporter_last_name = case when position(' ' in trim(reporter_name)) > 0 then regexp_replace(trim(reporter_name), '^.*\s+', '') else null end,
  preferred_contact = case when reporter_email is not null then 'email' else 'either' end;

alter table public.sighting_media
  add column media_type text check (media_type in ('image', 'video')),
  add column sort_order smallint not null default 0 check (sort_order >= 0),
  add column duration_seconds numeric(8,2) check (duration_seconds >= 0),
  add column scientific_use_approved boolean not null default false,
  add column public_use_approved boolean not null default false;

update public.sighting_media
set
  media_type = case when mime_type like 'video/%' then 'video' else 'image' end,
  scientific_use_approved = true,
  public_use_approved = public_approved;
with ordered_media as (
  select id, row_number() over (partition by sighting_id order by created_at, id) - 1 as next_order
  from public.sighting_media
)
update public.sighting_media
set sort_order = ordered_media.next_order
from ordered_media
where sighting_media.id = ordered_media.id;
alter table public.sighting_media alter column media_type set not null;
create unique index sighting_media_sort_order_uidx on public.sighting_media (sighting_id, sort_order);

create sequence if not exists public.road_hazard_number_seq;
create function public.generate_road_hazard_report_number()
returns text language sql volatile set search_path = public
as $$
  select 'STRASSE-' || extract(year from now())::int || '-' || lpad(nextval('public.road_hazard_number_seq')::text, 6, '0');
$$;

create table public.road_hazard_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique default public.generate_road_hazard_report_number(),
  reported_at timestamptz not null default now(),
  municipality text not null,
  exact_location geography(point, 4326) not null,
  public_location geography(point, 4326) not null,
  coordinate_uncertainty_m integer check (coordinate_uncertainty_m between 0 and 10000),
  road_name text not null check (char_length(road_name) between 1 and 160),
  locality text check (char_length(locality) <= 160),
  hazard_types text[] not null check (
    cardinality(hazard_types) > 0 and
    hazard_types <@ array['frequent_hedgehog_crossings','multiple_roadkills','high_vehicle_speed','barrier_or_wall','missing_passage','poor_visibility','road_drain_or_shaft','other']::text[]
  ),
  description text not null check (char_length(description) between 1 and 2000),
  scientific_use_consent boolean not null check (scientific_use_consent = true),
  privacy_notice_consent boolean not null check (privacy_notice_consent = true),
  verification_status public.verification_status not null default 'new',
  publication_status public.publication_status not null default 'private',
  reporter_contact_id uuid,
  client_submission_id uuid not null unique,
  submission_ip_hash text,
  submitted_locale text not null check (submitted_locale in ('de', 'it')),
  duplicate_of uuid references public.road_hazard_reports(id),
  internal_note text,
  validated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.prepare_road_hazard_location()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  new.public_location := public.blur_location(new.exact_location, 500);
  new.updated_at := now();
  return new;
end;
$$;
create trigger road_hazard_prepare_location
before insert or update of exact_location on public.road_hazard_reports
for each row execute function public.prepare_road_hazard_location();

alter table public.reporter_contacts alter column sighting_id drop not null;
alter table public.reporter_contacts add column road_hazard_report_id uuid unique references public.road_hazard_reports(id) on delete cascade;
alter table public.reporter_contacts
  add constraint reporter_contacts_parent_check check (num_nonnulls(sighting_id, road_hazard_report_id) = 1),
  add constraint reporter_contacts_contact_method_check check (reporter_email is not null or reporter_phone is not null) not valid;
alter table public.road_hazard_reports
  add constraint road_hazard_reporter_contact_fk foreign key (reporter_contact_id) references public.reporter_contacts(id);

alter table public.moderation_events alter column sighting_id drop not null;
alter table public.moderation_events add column road_hazard_report_id uuid references public.road_hazard_reports(id) on delete cascade;
alter table public.moderation_events
  add constraint moderation_events_parent_check check (num_nonnulls(sighting_id, road_hazard_report_id) = 1);

create index road_hazard_exact_location_gix on public.road_hazard_reports using gist (exact_location);
create index road_hazard_public_location_gix on public.road_hazard_reports using gist (public_location);
create index road_hazard_status_idx on public.road_hazard_reports (verification_status, publication_status, created_at desc);
create index road_hazard_municipality_idx on public.road_hazard_reports (municipality);
create index sightings_kind_status_idx on public.sightings (roadkill, verification_status, created_at desc);
create index sightings_observed_date_idx on public.sightings (observed_date desc);

alter table public.road_hazard_reports enable row level security;
create policy "staff read road hazards" on public.road_hazard_reports for select to authenticated using (public.has_staff_role());
create policy "staff update road hazards" on public.road_hazard_reports for update to authenticated using (public.has_staff_role()) with check (public.has_staff_role());
create policy "experts delete road hazards" on public.road_hazard_reports for delete to authenticated using (public.current_user_role() in ('expert', 'admin'));
revoke all on public.road_hazard_reports from anon, authenticated;
grant select, update, delete on public.road_hazard_reports to authenticated;

create view public.published_sightings as
select id, occurrence_id, observation_type, observed_at, observed_date,
  observed_time_from, observed_time_to, time_accuracy, individual_count,
  behavior, habitat, age_class, sex, roadkill, municipality, elevation_m,
  st_y(public_location::geometry) as public_latitude,
  st_x(public_location::geometry) as public_longitude, published_at
from public.sightings
where verification_status = 'validated' and publication_status = 'published';

create view public.published_road_hazards as
select id, report_number, reported_at, municipality, road_name, locality,
  hazard_types, description, coordinate_uncertainty_m,
  st_y(public_location::geometry) as public_latitude,
  st_x(public_location::geometry) as public_longitude, published_at
from public.road_hazard_reports
where verification_status = 'validated' and publication_status = 'published';

grant select on public.published_sightings to anon, authenticated;
grant select on public.published_road_hazards to anon, authenticated;

drop function public.create_sighting_with_contact(jsonb, jsonb, text);
create function public.create_sighting_with_contact(p_sighting jsonb, p_contact jsonb, p_submission_ip_hash text)
returns table (id uuid, occurrence_id text)
language plpgsql security invoker set search_path = public
as $$
declare
  created_sighting public.sightings;
  requested_client_id uuid := (p_sighting ->> 'client_submission_id')::uuid;
begin
  if p_submission_ip_hash is null or length(p_submission_ip_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_submission_ip_hash';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(requested_client_id::text, 0));
  select * into created_sighting from public.sightings where client_submission_id = requested_client_id;
  if found then return query select created_sighting.id, created_sighting.occurrence_id; return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_submission_ip_hash, 0));
  if (select count(*) from public.sightings where submission_ip_hash = p_submission_ip_hash and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;
  insert into public.sightings (
    observation_type, observed_at, observed_date, observed_time_from, observed_time_to, time_accuracy,
    individual_count, behavior, behavior_other, habitat, age_class, sex, animal_vital_status,
    animal_injured, roadkill, road_name, road_position, notes, exact_location,
    coordinate_uncertainty_m, municipality, locality, address_or_place, location_source,
    robot_mower_nearby, fence_nearby, road_nearby, pool_or_shaft_nearby,
    garden_passage_present, shelter_present, water_source_present,
    artificial_lighting_nearby, dog_or_cat_nearby, reporter_is_anonymous,
    scientific_use_consent, privacy_notice_consent, photo_publication_consent,
    contact_consent, newsletter_consent, client_submission_id, submission_ip_hash, submitted_locale
  ) select
    payload.observation_type, payload.observed_at, payload.observed_date, payload.observed_time_from,
    payload.observed_time_to, payload.time_accuracy, payload.individual_count, payload.behavior,
    payload.behavior_other, payload.habitat, payload.age_class, payload.sex, payload.animal_vital_status,
    payload.animal_injured, payload.roadkill, payload.road_name, payload.road_position, payload.notes,
    payload.exact_location, payload.coordinate_uncertainty_m, payload.municipality, payload.locality,
    payload.address_or_place, payload.location_source, payload.robot_mower_nearby, payload.fence_nearby,
    payload.road_nearby, payload.pool_or_shaft_nearby, payload.garden_passage_present,
    payload.shelter_present, payload.water_source_present, payload.artificial_lighting_nearby,
    payload.dog_or_cat_nearby, false, payload.scientific_use_consent, payload.privacy_notice_consent,
    payload.photo_publication_consent, payload.contact_consent, payload.newsletter_consent,
    payload.client_submission_id, p_submission_ip_hash, payload.submitted_locale
  from jsonb_populate_record(null::public.sightings, p_sighting) as payload returning * into created_sighting;

  insert into public.reporter_contacts (
    sighting_id, reporter_name, reporter_first_name, reporter_last_name,
    reporter_email, reporter_phone, preferred_contact
  ) values (
    created_sighting.id, nullif(p_contact ->> 'reporter_name', ''),
    nullif(p_contact ->> 'reporter_first_name', ''), nullif(p_contact ->> 'reporter_last_name', ''),
    nullif(p_contact ->> 'reporter_email', ''), nullif(p_contact ->> 'reporter_phone', ''),
    nullif(p_contact ->> 'preferred_contact', '')
  );
  return query select created_sighting.id, created_sighting.occurrence_id;
end;
$$;
revoke all on function public.create_sighting_with_contact(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_sighting_with_contact(jsonb, jsonb, text) to service_role;

create function public.create_road_hazard_with_contact(p_report jsonb, p_contact jsonb, p_submission_ip_hash text)
returns table (id uuid, report_number text)
language plpgsql security invoker set search_path = public
as $$
declare
  created_report public.road_hazard_reports;
  created_contact public.reporter_contacts;
  requested_client_id uuid := (p_report ->> 'client_submission_id')::uuid;
begin
  if p_submission_ip_hash is null or length(p_submission_ip_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_submission_ip_hash';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(requested_client_id::text, 0));
  select * into created_report from public.road_hazard_reports where client_submission_id = requested_client_id;
  if found then return query select created_report.id, created_report.report_number; return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_submission_ip_hash, 0));
  if (select count(*) from public.road_hazard_reports where submission_ip_hash = p_submission_ip_hash and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;
  insert into public.road_hazard_reports (
    municipality, exact_location, coordinate_uncertainty_m, road_name, locality,
    hazard_types, description, scientific_use_consent, privacy_notice_consent,
    client_submission_id, submission_ip_hash, submitted_locale
  ) select payload.municipality, payload.exact_location, payload.coordinate_uncertainty_m,
    payload.road_name, payload.locality, payload.hazard_types, payload.description,
    payload.scientific_use_consent, payload.privacy_notice_consent,
    payload.client_submission_id, p_submission_ip_hash, payload.submitted_locale
  from jsonb_populate_record(null::public.road_hazard_reports, p_report) as payload
  returning * into created_report;
  insert into public.reporter_contacts (
    road_hazard_report_id, reporter_name, reporter_first_name, reporter_last_name,
    reporter_email, reporter_phone, preferred_contact
  ) values (
    created_report.id, nullif(p_contact ->> 'reporter_name', ''),
    nullif(p_contact ->> 'reporter_first_name', ''), nullif(p_contact ->> 'reporter_last_name', ''),
    nullif(p_contact ->> 'reporter_email', ''), nullif(p_contact ->> 'reporter_phone', ''),
    nullif(p_contact ->> 'preferred_contact', '')
  ) returning * into created_contact;
  update public.road_hazard_reports set reporter_contact_id = created_contact.id where road_hazard_reports.id = created_report.id;
  return query select created_report.id, created_report.report_number;
end;
$$;
revoke all on function public.create_road_hazard_with_contact(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_road_hazard_with_contact(jsonb, jsonb, text) to service_role;

update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime','video/webm']
where id = 'sighting-media';
