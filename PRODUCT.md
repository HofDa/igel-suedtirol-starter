# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the finder.** A layperson in South Tyrol who has just encountered a
hedgehog: in their garden at dusk, on a road verge, under a hedge, next to a
robotic mower. They are outdoors, on a phone, one-handed, often at night, often
in a hurry, sometimes upset (the animal is injured or dead), and frequently on
poor mobile coverage in an alpine valley. They are not naturalists. They may
never have submitted a scientific record in their life, and they will abandon
the form if it feels like paperwork.

**Secondary — the expert.** Biologists and project staff who validate incoming
records, resolve duplicates, and export data for analysis. They work at a desk,
in bulk, and need to see uncertainty rather than have it smoothed away.

**Secondary — the moderator/admin.** Reviews the queue, releases photos, keeps
the audit trail.

The public surfaces are bilingual German/Italian because South Tyrol is
officially bilingual; neither language is a translation afterthought.

## Product Purpose

A citizen-science platform that collects hedgehog observations across South
Tyrol and turns them into a scientifically usable dataset. It has to be
simultaneously simple enough for a bystander with no training, rigorous enough
for a biologist to analyse, and defensive enough under data-protection law that
neither the animal nor the reporter is exposed. Success is a submitted,
validated record from someone who would not otherwise have reported anything.

## Positioning

Most nature-sighting apps optimise for the enthusiast and treat privacy as a
settings screen. This project inverts both: the reporting flow is built for a
one-time finder rather than a returning naturalist, and the privacy boundary is
structural rather than optional. Exact coordinates are stored internally but a
database trigger derives a 500 m grid `public_location`; no public view or
public API can emit `exact_location`. Personal contact data lives in a separate
table (`reporter_contacts`) from the observation itself (`sightings`). The
record schema maps to Darwin Core, so the data can leave the project and enter
established biodiversity infrastructure instead of dying in a private database.

## Operating Context

- Reporting happens **at the sighting**, outdoors, on a phone, in bad light and
  bad connectivity. Offline drafts are persisted to IndexedDB and restored on
  return; a lost connection must never produce a blocking modal.
- Installed as a PWA with a per-locale manifest and a service worker.
- Location is captured by GPS, by tapping a MapLibre map, or by typing
  coordinates — all three must work, because GPS fails under valley walls.
- Up to three photos or videos are optional, stored privately, and not published
  until each file has been separately released.
- The nine-step observation flow covers type, date/time, contact, location,
  animal, behaviour, habitat, media, and consent. Roadkill uses a shorter flow.
- Scientific records, reports of hazardous road sections, and urgent help are
  separate user intentions. `/hilfe` never silently creates a scientific record.
- Currently ships in **demo mode** by default (no Supabase project required),
  so demonstration data is visible on first run.

## Capabilities and Constraints

Confirmed functionality: bilingual DE/IT routing, nine-step report wizard, GPS
and manual coordinate entry, offline drafts, PWA manifest and service worker,
public MapLibre map with clustering, `/api/sightings` submission endpoint with
multiple media upload, separate road-hazard API/model, Supabase/PostGIS schema
with RLS and moderation, admin login and separate report queues.

Binding constraints (from `AGENTS.md`, non-negotiable):

1. No hardcoded visible text — every string lives in `messages/de.json` and
   `messages/it.json`, both always updated together.
2. No exact coordinates in any public map or API; only `public_location` or
   aggregates.
3. The service-role key never reaches a `'use client'` file.
4. Contact data stays in `reporter_contacts`, never in `sightings`.
5. No direct anonymous table mutation; submissions go through the controlled
   endpoint.
6. Schema changes as migrations under `supabase/migrations/`.
7. Mobile first and low-barrier: touch targets at least 44 × 44 px, forms fully
   keyboard-operable.
8. Offline without blocking popups; drafts saved locally, connection problems
   shown calmly and non-modally.
9. Scientific uncertainty must stay visible — unvalidated data is never
   presented as confirmed evidence.
10. No invented rescue advice. Emergency contacts and first-aid rules must be
    editorially cleared before they appear.

Undecided / not yet real: real rescue contact details, the
privacy policy text (`privacyPage.pending` is a placeholder), the project
  contact address, and any real observation
statistics.

## Brand Commitments

- Name: **Igel Südtirol**, run under the **b\*nature** organisation.
- `public/logo-igelprojekt.png` is the current temporary raster export of the
  official b\*nature Igelprojekt mark. The app icons are still placeholders;
  `docs/BRANDING.md` requires a clean SVG export, regenerated icons, documented
  clear space, and confirmed usage rights before public use.
- Fonts must be served locally from the package (currently `@fontsource`), not
  fetched from Google Fonts, so development, build, and page load never require
  a third-party connection. Any typographic change must preserve this.
- Voice: plain, calm, non-alarmist, addressed to a layperson. No gamification,
  no urgency theatre — an upset person holding an injured animal is a realistic
  user.

## Evidence on Hand

- Real: the Darwin Core field mapping (`docs/DATA_MODEL.md`), the RLS and
  moderation schema (`supabase/migrations/`), the bilingual message catalogues,
  the offline draft implementation.
- Synthetic and labelled as such: the demo sightings in
  `src/lib/sightings/demo.ts`, the home-page counters (486 / 72 / 38) and the
  admin counters (43 / 31 / 4), both already carrying a demo note, and the three
  example rows in the admin report table.
- Absent, and must not be fabricated: real sighting totals, real municipality
  coverage, real roadkill figures, named partner organisations, rescue-centre
  phone numbers, testimonials, and the privacy policy.

## Product Principles

1. **The finder is the constraint.** Every decision is judged against a
   stranger, outdoors, at night, on one bar of signal, who has thirty seconds of
   patience. If it works for them it can be made rigorous for the expert; the
   reverse is not true.
2. **Privacy is structural, not a setting.** The blur, the table separation, and
   the release gate are product features, and the interface should make that
   visible rather than hide it.
3. **Show uncertainty, don't launder it.** Unvalidated is a visible state.
   Demo data is visibly demo data.
4. **Degrade calmly.** Offline, GPS failure, upload failure and rate limits are
   expected conditions with designed states, never interruptions.
5. **Both languages are first languages.** Layout, length, and hierarchy must
   hold in German and Italian equally.

## Accessibility & Inclusion

Touch targets at least 44 × 44 px. Full keyboard operation of every form.
Bilingual DE/IT throughout. The audience skews broad and non-technical,
including older users, so text contrast, target size, and plain wording take
precedence over density.
