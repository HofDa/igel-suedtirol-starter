-- Local demonstration records. Coordinates are intentionally approximate.
insert into public.sightings (
  observation_type, verification_status, publication_status, observed_at, observed_date, observed_time_from,
  habitat, exact_location, location_source, scientific_use_consent,
  privacy_notice_consent, submitted_locale, municipality, roadkill, road_name, published_at
) values
('alive', 'validated', 'published', '2026-07-12 21:15:00+02', '2026-07-12', '21:15', 'private_garden', 'POINT(11.16 46.67)', 'map', true, true, 'de', 'meran', false, null, now()),
('dead', 'validated', 'published', '2026-07-10 06:30:00+02', '2026-07-10', '06:30', 'road_outside_settlement', 'POINT(11.35 46.50)', 'map', true, true, 'de', 'bozen', true, 'Demo-Straße', now()),
('alive', 'validated', 'published', '2026-07-08 22:00:00+02', '2026-07-08', '22:00', 'vineyard', 'POINT(11.24 46.41)', 'map', true, true, 'it', 'kaltern', false, null, now());
