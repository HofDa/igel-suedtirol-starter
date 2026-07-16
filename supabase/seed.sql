-- Local demonstration records. Coordinates are intentionally approximate.
insert into public.sightings (
  observation_type, verification_status, publication_status, observed_at,
  habitat, exact_location, location_source, scientific_use_consent,
  submitted_locale, municipality, roadkill, published_at
) values
('alive', 'validated', 'published', '2026-07-12 21:15:00+02', 'private_garden', 'POINT(11.16 46.67)', 'map', true, 'de', 'Meran', false, now()),
('dead', 'validated', 'published', '2026-07-10 06:30:00+02', 'road', 'POINT(11.35 46.50)', 'map', true, 'de', 'Bozen', true, now()),
('alive', 'validated', 'published', '2026-07-08 22:00:00+02', 'vineyard', 'POINT(11.24 46.41)', 'map', true, 'it', 'Kaltern', false, now());
