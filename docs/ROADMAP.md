# Roadmap

## Umgesetzt – aktualisierte Meldearchitektur

- fünf Hauptbereiche und gemeinsamer Einstieg „Melden & Hilfe“
- neun Schritte für Beobachtungen, verkürzter Straßenopfer-Ablauf
- Pflichtkontakt mit strikter Trennung in `reporter_contacts`
- 116 amtliche Südtiroler Gemeinden, Zeitspannen und erweiterte Fachdaten
- bis zu drei private Fotos/Videos mit Inhaltsprüfung und Medienfreigaben
- eigenes Straßenabschnitt-Modell, API, RLS, öffentliche View und Adminwarteschlange
- strikt getrennter SOS-Bereich und optionaler iNaturalist-Link

## Nächster Schritt – Produktionsfreigabe

- reale Hilfskontakte und Handlungsanweisungen fachlich/redaktionell freigeben
- Gemeinde-Polygonprüfung in PostGIS ergänzen
- rollenbasierte Admin-Detailansicht und atomare Einzelmedien-Freigabe fertigstellen
- Datenschutz, Impressum, Team und Partner rechtlich/redaktionell finalisieren

## Technisch verifiziert

- vollständiger Neuaufbau aller Migrationen gegen PostgreSQL 17/PostGIS
- API-Einreichung mit Bild, Kontakttrennung, Rollen-RLS, privater Storage und
  öffentliche 500-m-Verschleierung lokal und gegen Supabase-Staging getestet

## Wissenschaft und Betrieb

- CSV- und Darwin-Core-Export ohne Kontaktdaten
- standardisierte Gartenbeobachtung einschließlich Nullnachweisen
- Duplikatsuche und Verkehrs-Hotspot-Analyse
- Monitoring für Storage-Fehler und Offline-Upload-Wiederaufnahme
- rollenbasierte Gemeindeansichten und abgestimmte Datenübergaben
