# AGENTS.md – verbindliche Projektregeln

Diese Datei ist die primäre Arbeitsanweisung für alle Coding-Agenten.

## Produktziel

Die Anwendung ist eine mobile Citizen-Science-Plattform für Igelbeobachtungen in Südtirol. Sie muss für Laien einfach, für Fachleute auswertbar und datenschutzrechtlich defensiv sein.

## Unverhandelbare Regeln

1. **Keine hartcodierten sichtbaren Texte.** Alle UI-Texte liegen in `messages/de.json` und `messages/it.json`.
2. **Keine exakten Koordinaten öffentlich.** Öffentliche Karten und APIs verwenden ausschließlich `public_location` oder Aggregationen.
3. **Service-Role-Key nie im Client.** Dateien mit `'use client'` dürfen keine Server-Umgebungsvariablen importieren.
4. **Kontaktdaten getrennt halten.** Persönliche Daten gehören in `reporter_contacts`, nicht in `sightings`.
5. **Keine direkte anonyme Tabellenmutation.** Öffentliche Meldungen laufen über `/api/sightings` oder eine kontrollierte Edge Function.
6. **Migrationen statt manueller Datenbankänderungen.** Änderungen unter `supabase/migrations/` dokumentieren.
7. **Mobile first und barrierearm.** Touch-Ziele mindestens 44 × 44 px; Formulare müssen per Tastatur funktionieren.
8. **Offline ohne Blocker-Popups.** Entwürfe lokal sichern; Verbindungsprobleme ruhig und nicht-modal anzeigen.
9. **Wissenschaftliche Unsicherheit sichtbar machen.** Nicht validierte Daten nie als gesicherte Nachweise darstellen.
10. **Keine automatische Rettungsberatung erfinden.** Kontaktdaten und Notfallregeln müssen fachlich geprüft und redaktionell freigegeben sein.

## Architekturgrenzen

- `src/app`: Routing und Seitenkomposition
- `src/components`: UI und Feature-Komponenten
- `src/lib`: Domänenlogik, Validierung, Datenzugriff
- `src/types`: gemeinsame Typen
- `messages`: Übersetzungen
- `supabase`: Schema, Policies und Seeds

Server- und Client-Code strikt trennen. Eine Client-Komponente darf keine Admin-Clients importieren.

## Definition of Done für jedes Arbeitspaket

- beide Sprachen ergänzt
- TypeScript ohne Fehler
- ESLint ohne Fehler
- relevante Tests ergänzt oder angepasst
- Datenschutz- und Koordinatenregeln geprüft
- Dokumentation aktualisiert
- keine geheimen Schlüssel oder personenbezogenen Testdaten eingecheckt

## Bevor ein Agent Code ändert

1. `README.md`, `AGENTS.md` und die relevante Datei unter `docs/` lesen.
2. Betroffene Datenflüsse und Sicherheitsgrenzen nennen.
3. Kleine, nachvollziehbare Commits erzeugen.
4. Keine großflächigen Refactorings zusammen mit neuen Features vermischen.

## Priorisierte nächste Aufgaben

Siehe `docs/AGENT_TASKS.md`.
