# Agenten-Arbeitspakete

Jedes Paket sollte auf einem eigenen Branch bearbeitet werden.

## P0 – vor öffentlichem Test

### TASK-001: Supabase-E2E-Verbindung

- Migration lokal ausführen
- echte Meldung inklusive Foto speichern
- Fehlerzustände testen
- RLS und Storage-Policies verifizieren

### TASK-002: Moderationsdetailseite

- exakte Karte nur für berechtigte Rollen
- Validieren, Ablehnen, Duplikat markieren
- `moderation_events` bei jeder Änderung schreiben

### TASK-003: Redaktionelle Hilfeinhalte

- offizielle Südtiroler Kontaktwege fachlich prüfen
- Entscheidungsbaum mit Expertinnen abstimmen
- keine automatische Diagnose

### TASK-004: Datenschutzreview

- Einwilligungstexte finalisieren
- Lösch- und Aufbewahrungsfristen definieren
- Export- und Foto-Lizenzen festlegen

## P1 – nach internem Test

### TASK-101: Produktionsfähige Offline-Queue

- ausstehende Meldungen lokal kennzeichnen
- explizites erneutes Senden
- konflikt- und duplikatsicherer Client-Identifier

### TASK-102: Kartenfilter und Aggregation

- Filter nach Jahr, Status, Gemeinde und Habitat
- serverseitige Aggregation
- keine Rückschlüsse auf Privatgrundstücke

### TASK-103: Bildverarbeitung

- EXIF vollständig entfernen
- WebP-Derivate
- Thumbnail und Größenlimits
- Malware-/Dateitypprüfung

## P2 – wissenschaftliche Erweiterung

### TASK-201: Standardisierte Monitoring-Sessions

- Standorte, Besuche, Methoden und Nullbeobachtungen
- wiederholte Erhebungen
- separate Auswertbarkeit von opportunistischen Daten
