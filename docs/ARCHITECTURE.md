# Architektur

## Datenfluss einer öffentlichen Meldung

```text
ReportWizard
  → Zod-Validierung im Browser
  → FormData an POST /api/sightings
  → erneute Zod-Validierung am Server
  → Spam-/Dateiprüfung
  → transaktionale DB-Funktion
    → sightings (exakte + verschleierte Position)
    → reporter_contacts (optional, getrennt)
  → Storage + sighting_media (optional)
  → öffentliche Vorgangsnummer
```

## Vertrauenszonen

### Öffentlich

- Wissensseiten
- Meldeassistent
- ausschließlich veröffentlichte, verschleierte Kartenpunkte

### Moderation

- exakte Koordinaten
- Originalbilder
- Validierungsstatus
- interne Notizen

### Besonders geschützt

- Namen und E-Mail-Adressen
- Service-Role-Key
- vollständige Exporte mit exakten Koordinaten

## Demo-Modus

Bei `NEXT_PUBLIC_DEMO_MODE=true` simuliert die API erfolgreiche Meldungen. So können Design und Formularlogik ohne Backend entwickelt werden. Die Bestätigungsseite weist auf die Simulation hin.

Beobachtungsdatum und -zeit werden in der Projektzeitzone `Europe/Rome` interpretiert und mit dem zum Beobachtungsdatum passenden UTC-Offset gespeichert. Bei unbekannter Uhrzeit wird lokaler Mittag mit der Genauigkeit `date_only` verwendet.

Produktive Meldungen benötigen `SUBMISSION_HASH_SALT`. Die API hasht die vom vertrauenswürdigen Hosting-Proxy gelieferte Quelladresse per HMAC; Rohadressen werden nicht gespeichert. Die Datenbank begrenzt erfolgreiche Meldungen auf fünf pro Hash und Stunde. Eine zufällige `client_submission_id` macht Wiederholungen derselben Meldung idempotent. Zusätzlich muss auf Hosting-Ebene ein Request-Body-Limit von höchstens 9 MiB gesetzt werden, da `multipart/form-data` in der Route vollständig eingelesen wird.

## PWA und Offline

Der Service Worker bietet nur eine konservative Shell-Zwischenspeicherung. Formulardaten werden unabhängig davon in IndexedDB gespeichert. Für eine produktive Offline-Queue ist ein separates Arbeitspaket vorgesehen.
