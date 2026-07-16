create extension if not exists postgis;
create extension if not exists pgcrypto;

create type public.observation_type as enum ('alive', 'injured', 'dead', 'trace', 'uncertain');
create type public.verification_status as enum ('new', 'in_review', 'needs_clarification', 'validated', 'rejected', 'duplicate');
create type public.publication_status as enum ('private', 'approved', 'published');
create type public.habitat_type as enum ('private_garden', 'settlement', 'public_park', 'road', 'parking_area', 'orchard', 'vineyard', 'meadow', 'forest_edge', 'forest', 'water_edge', 'other', 'unknown');
create type public.user_role as enum ('viewer', 'moderator', 'expert', 'admin');

create sequence if not exists public.occurrence_number_seq;

create or replace function public.generate_occurrence_id()
returns text
language sql
volatile
set search_path = public
as $$
  select 'IGEL-' || extract(year from now())::int || '-' || lpad(nextval('public.occurrence_number_seq')::text, 6, '0');
$$;

create or replace function public.blur_location(input_location geography, grid_size_m integer default 500)
returns geography
language sql
immutable
strict
set search_path = public
as $$
  select st_transform(
    st_snaptogrid(st_transform(input_location::geometry, 25832), grid_size_m),
    4326
  )::geography;
$$;

create table public.sightings (
  id uuid primary key default gen_random_uuid(),
  occurrence_id text not null unique default public.generate_occurrence_id(),
  observation_type public.observation_type not null,
  verification_status public.verification_status not null default 'new',
  publication_status public.publication_status not null default 'private',
  observed_at timestamptz not null,
  time_accuracy text not null default 'exact' check (time_accuracy in ('exact', 'approximate', 'date_only')),
  individual_count smallint not null default 1 check (individual_count between 1 and 20),
  behavior text[] not null default '{}',
  habitat public.habitat_type not null default 'unknown',
  animal_injured boolean not null default false,
  roadkill boolean not null default false,
  notes text check (char_length(notes) <= 1000),
  exact_location geography(point, 4326) not null,
  public_location geography(point, 4326) not null,
  coordinate_uncertainty_m integer check (coordinate_uncertainty_m between 0 and 10000),
  municipality text,
  locality text,
  elevation_m integer,
  location_source text not null check (location_source in ('gps', 'map', 'address')),
  robot_mower_nearby boolean,
  fence_nearby boolean,
  road_nearby boolean,
  pool_or_shaft_nearby boolean,
  garden_passage_present boolean,
  shelter_present boolean,
  water_source_present boolean,
  reporter_is_anonymous boolean not null default true,
  scientific_use_consent boolean not null check (scientific_use_consent = true),
  photo_publication_consent boolean not null default false,
  contact_consent boolean not null default false,
  newsletter_consent boolean not null default false,
  internal_note text,
  duplicate_of uuid references public.sightings(id),
  submitted_locale text not null check (submitted_locale in ('de', 'it')),
  user_agent text,
  submission_ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  validated_at timestamptz,
  published_at timestamptz
);

create or replace function public.prepare_sighting_location()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.public_location := public.blur_location(new.exact_location, 500);
  new.updated_at := now();
  return new;
end;
$$;

create trigger sightings_prepare_location
before insert or update of exact_location on public.sightings
for each row execute function public.prepare_sighting_location();

create index sightings_exact_location_gix on public.sightings using gist (exact_location);
create index sightings_public_location_gix on public.sightings using gist (public_location);
create index sightings_observed_at_idx on public.sightings (observed_at desc);
create index sightings_status_idx on public.sightings (verification_status, publication_status);

create table public.reporter_contacts (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null unique references public.sightings(id) on delete cascade,
  reporter_name text,
  reporter_email text,
  created_at timestamptz not null default now()
);

create table public.sighting_media (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references public.sightings(id) on delete cascade,
  storage_path text not null unique,
  thumbnail_path text,
  mime_type text,
  file_size_bytes integer,
  width_px integer,
  height_px integer,
  identification_evidence boolean not null default true,
  public_approved boolean not null default false,
  copyright_holder text,
  license text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references public.sightings(id) on delete cascade,
  moderator_id uuid references public.profiles(id),
  previous_status public.verification_status,
  new_status public.verification_status,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'viewer'::public.user_role);
$$;

create or replace function public.has_staff_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('moderator', 'expert', 'admin');
$$;

alter table public.sightings enable row level security;
alter table public.reporter_contacts enable row level security;
alter table public.sighting_media enable row level security;
alter table public.profiles enable row level security;
alter table public.moderation_events enable row level security;

create policy "staff read sightings" on public.sightings for select to authenticated using (public.has_staff_role());
create policy "staff update sightings" on public.sightings for update to authenticated using (public.has_staff_role()) with check (public.has_staff_role());
create policy "experts delete sightings" on public.sightings for delete to authenticated using (public.current_user_role() in ('expert', 'admin'));

create policy "staff read media" on public.sighting_media for select to authenticated using (public.has_staff_role());
create policy "staff update media" on public.sighting_media for update to authenticated using (public.has_staff_role()) with check (public.has_staff_role());

create policy "restricted read contacts" on public.reporter_contacts for select to authenticated using (public.current_user_role() in ('expert', 'admin'));
create policy "admins manage contacts" on public.reporter_contacts for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_user_role() = 'admin');
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "staff read moderation" on public.moderation_events for select to authenticated using (public.has_staff_role());
create policy "staff add moderation" on public.moderation_events for insert to authenticated with check (public.has_staff_role() and moderator_id = auth.uid());

create view public.published_sightings as
select
  id,
  occurrence_id,
  observation_type,
  observed_at,
  individual_count,
  behavior,
  habitat,
  roadkill,
  municipality,
  elevation_m,
  st_y(public_location::geometry) as public_latitude,
  st_x(public_location::geometry) as public_longitude,
  published_at
from public.sightings
where verification_status = 'validated'
  and publication_status = 'published';

revoke all on public.sightings from anon, authenticated;
revoke all on public.reporter_contacts from anon, authenticated;
revoke all on public.sighting_media from anon, authenticated;
grant select on public.sightings to authenticated;
grant update, delete on public.sightings to authenticated;
grant select, update on public.sighting_media to authenticated;
grant select, insert, update, delete on public.reporter_contacts to authenticated;
grant select, insert on public.moderation_events to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.published_sightings to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sighting-media', 'sighting-media', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "staff read sighting media objects"
on storage.objects for select to authenticated
using (bucket_id = 'sighting-media' and public.has_staff_role());

create policy "staff manage sighting media objects"
on storage.objects for all to authenticated
using (bucket_id = 'sighting-media' and public.has_staff_role())
with check (bucket_id = 'sighting-media' and public.has_staff_role());
