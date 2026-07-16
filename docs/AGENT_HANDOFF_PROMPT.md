# Übergabe-Prompt für einen Coding-Agenten

```text
Du arbeitest am Repository „Igel Südtirol“.

Lies zuerst vollständig:
1. AGENTS.md
2. README.md
3. docs/ARCHITECTURE.md
4. docs/DATA_MODEL.md
5. docs/AGENT_TASKS.md

Bearbeite anschließend ausschließlich das Arbeitspaket: [TASK-ID UND BESCHREIBUNG].

Bevor du Code änderst:
- beschreibe den betroffenen Datenfluss,
- nenne Sicherheits- und Datenschutzgrenzen,
- liste die Dateien auf, die du voraussichtlich änderst.

Verbindliche Regeln:
- keine hartcodierten sichtbaren Texte,
- Deutsch und Italienisch gemeinsam pflegen,
- exakte Koordinaten niemals öffentlich ausgeben,
- Service-Role-Key niemals in Client-Code,
- Kontaktdaten getrennt von Beobachtungsdaten,
- Migrationen für Datenbankänderungen,
- Offline-Fehler nicht als blockierende Popups.

Führe zum Abschluss aus:
npm run check
npm run build

Berichte danach:
- geänderte Dateien,
- ausgeführte Tests,
- verbleibende Risiken,
- sinnvollen nächsten Schritt.
```
