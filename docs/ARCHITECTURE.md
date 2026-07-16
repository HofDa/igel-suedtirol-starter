# Architektur

## Datenfluss einer öffentlichen Meldung

```text
ReportWizard
  → Zod-Validierung im Browser
  → FormData an POST /api/sightings
  → erneute Zod-Validierung am Server
  → Spam-/Dateiprüfung
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

## PWA und Offline

Der Service Worker bietet nur eine konservative Shell-Zwischenspeicherung. Formulardaten werden unabhängig davon in IndexedDB gespeichert. Für eine produktive Offline-Queue ist ein separates Arbeitspaket vorgesehen.
