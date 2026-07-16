# Datenmodell

## Kernobjekte

- `sightings`: fachliche Beobachtungsdaten und Geometrien
- `reporter_contacts`: optionale personenbezogene Kontaktdaten
- `sighting_media`: Bilder und Freigabestatus
- `profiles`: Rollen der Fachnutzer
- `moderation_events`: unveränderbare Prüfungshistorie

## Darwin-Core-Abbildung

| Projektfeld | Darwin Core |
|---|---|
| occurrence_id | occurrenceID |
| observed_at | eventDate |
| exact_location | decimalLatitude / decimalLongitude |
| coordinate_uncertainty_m | coordinateUncertaintyInMeters |
| municipality | municipality |
| individual_count | individualCount |
| behavior | behavior |
| habitat | habitat |
| verification_status | identificationVerificationStatus |

## Geodaten

Intern wird `exact_location` gespeichert. Ein Trigger berechnet `public_location` auf einem 500-m-Raster. Öffentliche Ansichten enthalten niemals `exact_location`.
