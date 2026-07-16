create or replace function public.create_sighting_with_contact(
  p_sighting jsonb,
  p_contact jsonb default null
)
returns table (id uuid, occurrence_id text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_sighting public.sightings;
begin
  insert into public.sightings (
    observation_type,
    observed_at,
    time_accuracy,
    individual_count,
    behavior,
    habitat,
    animal_injured,
    roadkill,
    notes,
    exact_location,
    coordinate_uncertainty_m,
    location_source,
    robot_mower_nearby,
    fence_nearby,
    road_nearby,
    pool_or_shaft_nearby,
    garden_passage_present,
    shelter_present,
    water_source_present,
    reporter_is_anonymous,
    scientific_use_consent,
    photo_publication_consent,
    contact_consent,
    newsletter_consent,
    submitted_locale
  )
  select
    payload.observation_type,
    payload.observed_at,
    payload.time_accuracy,
    payload.individual_count,
    payload.behavior,
    payload.habitat,
    payload.animal_injured,
    payload.roadkill,
    payload.notes,
    payload.exact_location,
    payload.coordinate_uncertainty_m,
    payload.location_source,
    payload.robot_mower_nearby,
    payload.fence_nearby,
    payload.road_nearby,
    payload.pool_or_shaft_nearby,
    payload.garden_passage_present,
    payload.shelter_present,
    payload.water_source_present,
    payload.reporter_is_anonymous,
    payload.scientific_use_consent,
    payload.photo_publication_consent,
    payload.contact_consent,
    payload.newsletter_consent,
    payload.submitted_locale
  from jsonb_populate_record(null::public.sightings, p_sighting) as payload
  returning * into created_sighting;

  if p_contact is not null then
    insert into public.reporter_contacts (sighting_id, reporter_name, reporter_email)
    values (
      created_sighting.id,
      nullif(p_contact ->> 'reporter_name', ''),
      nullif(p_contact ->> 'reporter_email', '')
    );
  end if;

  return query select created_sighting.id, created_sighting.occurrence_id;
end;
$$;

revoke all on function public.create_sighting_with_contact(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_sighting_with_contact(jsonb, jsonb) to service_role;
