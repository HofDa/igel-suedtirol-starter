import {defineRouting} from 'next-intl/routing';
import {publicEnv} from '@/lib/env';

// Die lokalisierten Pfade werden zur Laufzeit vom Proxy umgeschrieben
// (`src/proxy.ts`). Der statische Export für die GitHub-Pages-Demo läuft ohne
// Proxy: Dort existieren nur die kanonischen Segmente aus dem Dateisystem, ein
// Link auf `/it/mappa` liefe also ins Leere. Für den Export fallen deshalb
// beide Sprachen auf denselben Pfad zurück.
const localizedPathnames = {
  '/': '/',
  '/melden': {
    de: '/melden',
    it: '/segnala'
  },
  '/melden/beobachtung': {
    de: '/melden/beobachtung',
    it: '/segnala/osservazione'
  },
  '/melden/strassenopfer': {
    de: '/melden/strassenopfer',
    it: '/segnala/vittima-della-strada'
  },
  '/melden/strassenabschnitt': {
    de: '/melden/strassenabschnitt',
    it: '/segnala/tratto-stradale'
  },
  '/karte': {
    de: '/karte',
    it: '/mappa'
  },
  '/igel': {
    de: '/igel',
    it: '/riccio'
  },
  '/schutz': {
    de: '/schutz',
    it: '/proteggere'
  },
  '/hilfe': {
    de: '/hilfe',
    it: '/aiuto'
  },
  '/ergebnisse': {
    de: '/ergebnisse',
    it: '/risultati'
  },
  '/projekt': {
    de: '/projekt',
    it: '/progetto'
  },
  '/ueber-uns': {
    de: '/ueber-uns',
    it: '/chi-siamo'
  },
  '/impressum': {
    de: '/impressum',
    it: '/note-legali'
  },
  '/datenschutz': {
    de: '/datenschutz',
    it: '/privacy'
  },
  '/offline': '/offline',
  '/admin': '/admin',
  '/admin/login': '/admin/login',
  '/admin/meldungen': {
    de: '/admin/meldungen',
    it: '/admin/segnalazioni'
  },
  '/admin/strassenabschnitte': {
    de: '/admin/strassenabschnitte',
    it: '/admin/tratti-stradali'
  }
};

type PathnameMap = typeof localizedPathnames;

// Behält die Schlüssel bei und reduziert nur die sprachabhängigen Werte auf das
// kanonische Segment. Die Zusicherung ist nötig, weil `Object.fromEntries` die
// Schlüssel zu `string` verbreitert; für `Link` und `useRouter` zählen genau
// diese Schlüssel, die Werte sind zur Laufzeit gültige Pfade.
function toCanonicalPathnames(pathnames: PathnameMap): PathnameMap {
  return Object.fromEntries(
    Object.entries(pathnames).map(([template, target]) => [
      template,
      typeof target === 'string' ? target : target.de
    ])
  ) as unknown as PathnameMap;
}

export const routing = defineRouting({
  locales: ['de', 'it'],
  defaultLocale: 'de',
  localePrefix: 'always',
  pathnames: publicEnv.staticExport
    ? toCanonicalPathnames(localizedPathnames)
    : localizedPathnames
});

export type Locale = (typeof routing.locales)[number];
