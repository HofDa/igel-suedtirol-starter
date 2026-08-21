# Architektur

## Getrennte Nutzerabsichten

`/[locale]/melden` entscheidet zwischen Beobachtung, Straßenopfer,
problematischem Straßenabschnitt und SOS-Hilfe. Nur die ersten drei erzeugen
Citizen-Science-Daten. `/hilfe` ist eine Informationsseite, liest freigegebene
Kontakte aus serverseitiger Konfiguration und sendet niemals automatisch Daten.

## Datenfluss einer Sichtung

```text
ReportWizard (Beobachtung: 9 Schritte; Straßenopfer: 6 Schritte)
  → Zod-Validierung im Browser
  → FormData an POST /api/sightings
  → erneute Zod- und Dateisignatur-Prüfung am Server
  → transaktionale RPC create_sighting_with_contact
    → sightings (Fachdaten, exact_location, public_location)
    → reporter_contacts (Pflichtkontakt, getrennt)
  → private Storage-Blobs + sighting_media (0–3, geordnete Dateien)
```

Bilder werden mit `sharp` anhand ihres Inhalts gelesen, entsprechend der
EXIF-Orientierung gedreht und als WebP ohne EXIF/XMP/ICC-Metadaten neu kodiert.
Videos werden anhand ihrer Signatur geprüft und unverändert privat gespeichert.
Die wissenschaftliche Mediennutzung und eine freiwillige öffentliche Nutzung
sind getrennte Freigaben.

## Datenfluss eines Straßenabschnitts

```text
RoadHazardForm
  → Zod-Validierung
  → POST /api/road-hazards
  → RPC create_road_hazard_with_contact
    → road_hazard_reports
    → reporter_contacts
```

Ein Straßenabschnitt wird niemals in `sightings` eingefügt. Beide Endpunkte
verwenden idempotente Client-IDs, einen HMAC-Quellhash und eine Rate-Limit-Prüfung.
Anonyme Browser besitzen keine direkten Schreibrechte auf Kerntabellen.

## Vertrauenszonen

- **Öffentlich:** nur validierte Datensätze aus `published_sightings` und
  `published_road_hazards`; beide Views geben ausschließlich aus
  `public_location` berechnete Koordinaten aus.
- **Moderation:** exakte Koordinaten, Originalvideos, Medienfreigaben,
  Prüfstatus, Duplikatbezüge und unveränderte Moderationshistorie.
- **Besonders geschützt:** Namen, E-Mail, Telefon und Service-Role-Key.
  Kontaktdaten liegen ausschließlich in `reporter_contacts` und werden nur für
  berechtigte Rollen geladen.

Die öffentliche Karte bündelt die freigegebenen `public_location`-Positionen in
kleinen Zoomstufen. Ab Zoomstufe 12 zeichnet sie die tatsächliche öffentliche
500-m-Rasterzelle statt eines vermeintlich exakten Punktes. Die Meldungsliste
enthält ebenfalls weder Koordinaten noch Kontaktdaten.

## Datum, Zeit und Ort

Das Beobachtungsdatum beginnt leer und wird als `observed_date` gespeichert;
`created_at` bleibt das automatische Eingangsdatum. Exakte Uhrzeit,
Zeitspanne und `date_only` werden getrennt abgebildet. `observed_at` bleibt für
Darwin-Core-Kompatibilität und verwendet bei unbekannter Uhrzeit lokalen Mittag
in `Europe/Rome`.

Die erlaubten 116 Gemeinden liegen typisiert in
`src/lib/locations/south-tyrol-municipalities.ts`. Quelle ist die amtliche
ASTAT-Gemeindetabelle 1950–2025. Die API prüft zusätzlich eine konservative
Projekt-Hüllbox. Eine spätere Zuordnung über Gemeindegeometrien kann serverseitig
ergänzt werden.

## Demo, PWA und Offline

Bei `NEXT_PUBLIC_DEMO_MODE=true` simulieren beide APIs erfolgreiche Meldungen
ohne Supabase. Beobachtungsentwürfe einschließlich neuer Formularfelder und
Media-Blobs werden in IndexedDB gespeichert. Browser können große Video-Blobs
unter Speicherdruck dennoch verwerfen; die restlichen Formulardaten bleiben
unabhängig davon erhalten. Verbindungsfehler werden nicht-modal angezeigt.

Die Sichtungsroute begrenzt Requests auf 60 MiB, einzelne Bilder auf 8 MiB,
Videos auf 25 MiB und die Anzahl auf drei Dateien. Dasselbe Request-Limit sollte
am Hosting-Proxy gesetzt werden.

## Supabase-End-to-End-Grenze

`npm run test:supabase` ist bewusst von den schnellen Unit-Tests getrennt und
benötigt einen laufenden lokalen Stack oder explizit freigegebene
Staging-Zugangsdaten. Der Test durchläuft die echte API-Route, RPCs, PostGIS,
private Storage-Verarbeitung und RLS mit Viewer-, Moderator- und Expertenrolle.
Remote-Ausführungen erfordern `SUPABASE_E2E_ALLOW_REMOTE=true`; Produktion ist
kein zulässiges Testziel. Alle synthetischen Testobjekte werden abschließend
entfernt.

Ein explizit als Staging benanntes, per CLI verknüpftes Projekt kann mit
`npm run test:supabase:staging` geprüft werden. Der Lauf vom 20. August 2026
gegen ein Supabase-Projekt in Frankfurt bestand alle fünf Daten-, Rollen-,
Storage- und Datenschutzprüfungen; die anschließende Bereinigung ergab keine
verbliebenen Testkonten, Sichtungen oder Storage-Objekte.

## Grundkarte

Beide Karten – die öffentliche Übersicht und die Standortwahl im Meldeformular –
bauen ihren Stil über `src/lib/map/basemap.ts`. Der Stil wird als Objekt erzeugt
und nicht als `style.json` geladen; das spart eine Netzanfrage vor dem ersten
Kartenbild und hält Quelle und Quellenangabe zusammen.

Die Kacheln stammen vom amtlichen WMTS der Autonomen Provinz Bozen – Südtirol
(`geoservices.buergernetz.bz.it`, Ebene `p_bz-BaseMap:Basemap-Monochromatic`,
Kachelsatz `EPSG_3857`). Diese Wahl ist bewusst:

- Sie ist die zuständige amtliche Quelle für genau das Projektgebiet und offen
  zugänglich; die Capabilities melden „Fees: none" und
  „AccessConstraints: none".
- Sie verlangt keinen Schlüssel. Es liegt also kein Zugangstoken im Client, und
  es gibt keinen kommerziellen Zwischendienst, der die Aufrufe der Melderinnen
  und Melder mitliest – das passt zur defensiven Datenschutzhaltung des
  Projekts.
- Die einfarbige Fassung ist blass genug, dass die Meldungen in Blüte-Pink die
  lautesten Elemente der Karte bleiben.

Der Kartenausschnitt ist über `MAP_MAX_BOUNDS` auf `SOUTH_TYROL_PROJECT_BOUNDS`
begrenzt – dieselben Grenzen, die `reportSchema` für Meldungen prüft. Außerhalb
liefert der Provinzdienst ohnehin keine Kacheln, und ein Punkt dort wäre keine
gültige Meldung.

`NEXT_PUBLIC_MAP_STYLE_URL` bleibt als Ausweg bestehen und gewinnt, wenn
gesetzt. Der Betrieb verantwortet dann Kachelquelle und Quellenangabe selbst.
Der frühere Vorgabewert `demotiles.maplibre.org` war der Demo-Server des
MapLibre-Projekts, ist nicht für den Produktivbetrieb gedacht und antwortete
zuletzt mit HTTP 429 – die Karte blieb dadurch leer.
