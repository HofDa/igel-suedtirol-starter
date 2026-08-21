# Datenmodell

## Kernobjekte

- `sightings`: einzelne Igelbeobachtungen einschließlich Straßenopfer
- `road_hazard_reports`: problematische Straßenabschnitte ohne notwendige Tierbeobachtung
- `reporter_contacts`: Vorname, Nachname, E-Mail, Telefon und bevorzugter Kontaktweg; referenziert genau eines der beiden Fachobjekte
- `sighting_media`: bis zu drei geordnete private Bilder/Videos mit getrennten Freigaben
- `profiles`: Rollen der Fachnutzer
- `moderation_events`: unveränderbare Historie für Sichtungen oder Straßenabschnitte

## Pflicht- und optionale Sichtungsfelder

Pflicht sind Meldeart, Datum, Zeitgenauigkeit, Vor- und Nachname, mindestens
E-Mail oder Telefon, Gemeinde, Koordinaten, Anzahl, Lebensraum,
wissenschaftliche Einwilligung und Bestätigung der Datenschutzhinweise.
Alter, Geschlecht und unbekannte Uhrzeit besitzen explizite `unknown`- bzw.
`date_only`-Werte. Verhalten, Bemerkung und Medien sind optional. Bei Medien
ist die fachlich-wissenschaftliche Nutzung erforderlich; öffentliche Nutzung,
Rückfragen und Newsletter bleiben freiwillig.

Straßenopfer setzen `observation_type = 'dead'` und `roadkill = true`; Straße
und Straßenposition ergänzen den verkürzten Ablauf. Ein Straßenabschnitt hat
einen eigenen Berichtsschlüssel, Gefahrenkategorien, Beschreibung und eigene
Moderations-/Publikationsstatus.

## Darwin-Core-Abbildung

| Projektfeld | Darwin Core |
|---|---|
| occurrence_id | occurrenceID |
| observed_at | eventDate |
| exact_location | decimalLatitude / decimalLongitude (nur geschützter Export) |
| coordinate_uncertainty_m | coordinateUncertaintyInMeters |
| municipality | municipality |
| individual_count | individualCount |
| behavior | behavior |
| habitat | habitat |
| sex | sex |
| age_class | lifeStage |
| verification_status | identificationVerificationStatus |

`road_hazard_reports` besitzt bewusst keine Darwin-Core-Abbildung, weil ohne
Tierbeobachtung kein `Occurrence` vorliegt.

## Geodaten und Öffentlichkeit

Trigger berechnen für beide Fachobjekte aus `exact_location` ein 500-m-Raster
in `public_location`. Öffentliche Views enthalten weder `exact_location` noch
Kontaktfelder. Nicht validierte oder nicht veröffentlichte Zeilen erscheinen
nicht in diesen Views.

## Migration

`202607310001_updated_reporting_requirements.sql` ersetzt die alte
Habitat-Taxonomie verlustfrei, leitet Datum und Uhrzeit aus bestehenden
Zeitstempeln ab, bewahrt alte Namen im Kontaktbestand, nummeriert vorhandene
Medien und ergänzt das Straßenabschnitt-Modell samt RLS, Indizes, RPCs und
öffentlichen Views.
