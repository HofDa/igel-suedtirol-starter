# Igel Südtirol – Citizen-Science-Starter

Agentenfreundliches Grundgerüst für eine zweisprachige Citizen-Science-Plattform zur Erfassung von Igelbeobachtungen in Südtirol.

## Enthalten

- Next.js App Router, TypeScript und Tailwind CSS
- Deutsch/Italienisch mit `next-intl`
- neun verständliche Schritte für Beobachtungen und ein verkürzter Straßenopfer-Ablauf
- getrennte Einstiege für Citizen Science, problematische Straßenabschnitte und SOS-Hilfe
- GPS-Erfassung und manuelle Koordinateneingabe
- lokale Offline-Entwürfe mit IndexedDB
- PWA-Manifest und einfacher Service Worker
- öffentliche MapLibre-Karte mit Demo-Daten
- Supabase/PostGIS-Migration mit RLS, Moderation und Datenschutztrennung
- kontrollierte API-Routen für Sichtungen und Straßenabschnitte
- privater Mehrfachupload für bis zu drei Fotos oder Videos mit serverseitiger MIME-Prüfung und Entfernung von Bildmetadaten
- Admin-Startseiten und Login-Grundgerüst
- Darwin-Core-orientiertes Datenmodell
- Anweisungen und Arbeitspakete für Coding-Agenten

## Schnellstart

Vorausgesetzt werden Node.js 22 oder neuer und npm 10.9.7. Die erwarteten
Versionen lassen sich mit `node --version` und `npm --version` prüfen.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Öffne anschließend `http://localhost:3000`. Standardmäßig läuft die Anwendung im **Demo-Modus** und benötigt kein Supabase-Projekt.

Der Entwicklungsserver verwendet den webpack-Compiler. Der Turbopack-Dev-Compiler
von Next.js 16.2.10 kann in der lokalen Projektumgebung beim ersten Seitenaufruf
hängen; der Produktionsbuild bleibt davon unberührt.

## Supabase aktivieren

1. Ein Supabase-Projekt erstellen.
2. Werte aus `.env.example` in `.env.local` eintragen.
3. Alle Migrationen unter `supabase/migrations/` in Reihenfolge ausführen.
4. `NEXT_PUBLIC_DEMO_MODE=false` setzen.
5. Einen ersten Auth-Benutzer anlegen und dessen Rolle in `profiles` auf `admin` oder `expert` setzen.

Lokale Supabase-CLI:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types
```

### Supabase-End-to-End-Prüfung

Der separate E2E-Test reicht über die kontrollierte API eine synthetische
Beobachtung samt PNG ein und prüft anschließend Datenbank, Kontakttrennung,
Bildverarbeitung, private Storage-Policies, Rollen-RLS und die ausschließlich
verschleierten öffentlichen Koordinaten. Testzeilen, Testkonto und Storage-Datei
werden danach entfernt.

Mit einem bereits laufenden lokalen Stack:

```bash
npm run test:supabase
```

Für einen vollständigen lokalen Neuaufbau einschließlich Migrationen und Seed
(löscht ausschließlich die lokale Supabase-Datenbank dieses Projekts):

```bash
npm run test:supabase:local
```

Ein Staging-Projekt wird nur nach expliziter Freigabe akzeptiert. Niemals gegen
Produktion ausführen:

```bash
SUPABASE_E2E_URL=https://example.supabase.co \
SUPABASE_E2E_PUBLISHABLE_KEY=... \
SUPABASE_E2E_SERVICE_ROLE_KEY=... \
SUPABASE_E2E_ALLOW_REMOTE=true \
npm run test:supabase
```

`SUPABASE_E2E_SERVICE_ROLE_KEY` akzeptiert sowohl einen klassischen
Service-Role-JWT als auch den aktuellen Supabase-Secret-Key (`sb_secret_…`).

### Verknüpftes Staging-Projekt

Nach `supabase link` erzeugt der folgende Befehl eine ignorierte lokale
Staging-Konfiguration mit Dateirechten 0600. Er akzeptiert ausschließlich ein
Supabase-Projekt, dessen Name ausdrücklich `staging` enthält, und gibt keine
Schlüssel aus:

```bash
npm run configure:staging
npm run dev:staging
```

Die Servervariable akzeptiert den aktuellen Secret-Key oder vorübergehend den
Legacy-Service-Role-Key. Beide bleiben strikt serverseitig; vor Abschaltung der
Legacy-Schlüssel muss Staging auf einen verifizierten `sb_secret_…`-Key
umgestellt werden.

Der produktionsnahe E2E-Test kann ebenfalls direkt gegen das verknüpfte
Staging-Projekt laufen. Er erzeugt nur synthetische Testdaten und entfernt sie
anschließend:

```bash
npm run test:supabase:staging
```

## Qualitätsprüfung

```bash
npm run check
npm run build
```

## GitHub-Pages-Demo

GitHub Pages stellt ausschließlich statische Dateien bereit. Der Pages-Build ist
daher bewusst eine öffentliche Demo: Karte und Formulare verwenden lokale
Demodaten, Meldungen werden nicht übertragen oder gespeichert, und Adminseiten
sowie Server-APIs sind nicht Teil des Artefakts. Der normale Produktionsbuild
bleibt davon unberührt.

Lokal lässt sich das statische Artefakt unter `out/` erzeugen:

```bash
npm run build:pages
```

Der Workflow `.github/workflows/deploy-pages.yml` prüft, baut und veröffentlicht
die Demo nach Änderungen auf `main` sowie bei manueller Ausführung. In den
Repository-Einstellungen muss unter **Pages → Build and deployment → Source**
einmalig **GitHub Actions** ausgewählt sein. Für diesen Workflow werden keine
Supabase-Schlüssel benötigt oder eingebunden.

## Wichtige Sicherheitsregeln

- Exakte Beobachtungsorte niemals über öffentliche Endpunkte ausgeben.
- `SUPABASE_SERVICE_ROLE_KEY` ausschließlich serverseitig verwenden.
- Kontaktdaten bleiben von Beobachtungsdaten getrennt.
- Anonyme Browser dürfen nicht direkt in Kerntabellen schreiben.
- Fotos erst nach separater Freigabe öffentlich ausliefern.

## Melden und Hilfe

`/[locale]/melden` ist eine Auswahlseite. Wissenschaftliche Beobachtungen laufen über
`/melden/beobachtung`, Straßenopfer über `/melden/strassenopfer` und Gefahrenstellen
über `/melden/strassenabschnitt`. `/hilfe` übermittelt nichts automatisch; dort werden
nur redaktionell bestätigte Kontakte aus `HELP_CONTACTS_JSON` angezeigt. Ein leerer
Kontaktbestand erzeugt ausschließlich in der Entwicklungsumgebung einen klaren
Redaktionshinweis.

Kontakte sind für wissenschaftliche Meldungen verpflichtend, werden jedoch ausschließlich
in `reporter_contacts` gespeichert. Die Freigabe von Medien für öffentliche Verwendung
ist freiwillig und von ihrer Nutzung zur fachlichen Prüfung getrennt.

Der alternative iNaturalist-Link erscheint nur, wenn
`NEXT_PUBLIC_INATURALIST_PROJECT_URL` gesetzt ist.

Weitere Details stehen in `AGENTS.md` und im Ordner `docs/`.
