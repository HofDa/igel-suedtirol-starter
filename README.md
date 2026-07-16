# Igel Südtirol – Citizen-Science-Starter

Agentenfreundliches Grundgerüst für eine zweisprachige Citizen-Science-Plattform zur Erfassung von Igelbeobachtungen in Südtirol.

## Enthalten

- Next.js App Router, TypeScript und Tailwind CSS
- Deutsch/Italienisch mit `next-intl`
- funktionaler siebenstufiger Meldeassistent
- GPS-Erfassung und manuelle Koordinateneingabe
- lokale Offline-Entwürfe mit IndexedDB
- PWA-Manifest und einfacher Service Worker
- öffentliche MapLibre-Karte mit Demo-Daten
- Supabase/PostGIS-Migration mit RLS, Moderation und Datenschutztrennung
- API-Route für Meldungen und Foto-Uploads
- Admin-Startseiten und Login-Grundgerüst
- Darwin-Core-orientiertes Datenmodell
- Anweisungen und Arbeitspakete für Coding-Agenten

## Schnellstart

```bash
cp .env.example .env.local
npm install
npm run dev
```

Öffne anschließend `http://localhost:3000`. Standardmäßig läuft die Anwendung im **Demo-Modus** und benötigt kein Supabase-Projekt.

## Supabase aktivieren

1. Ein Supabase-Projekt erstellen.
2. Werte aus `.env.example` in `.env.local` eintragen.
3. Migration `supabase/migrations/202607160001_initial_schema.sql` ausführen.
4. `NEXT_PUBLIC_DEMO_MODE=false` setzen.
5. Einen ersten Auth-Benutzer anlegen und dessen Rolle in `profiles` auf `admin` oder `expert` setzen.

Lokale Supabase-CLI:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types
```

## Qualitätsprüfung

```bash
npm run check
npm run build
```

## Wichtige Sicherheitsregeln

- Exakte Beobachtungsorte niemals über öffentliche Endpunkte ausgeben.
- `SUPABASE_SERVICE_ROLE_KEY` ausschließlich serverseitig verwenden.
- Kontaktdaten bleiben von Beobachtungsdaten getrennt.
- Anonyme Browser dürfen nicht direkt in Kerntabellen schreiben.
- Fotos erst nach separater Freigabe öffentlich ausliefern.

Weitere Details stehen in `AGENTS.md` und im Ordner `docs/`.
