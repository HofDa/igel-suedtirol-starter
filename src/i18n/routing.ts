import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'it'],
  defaultLocale: 'de',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/melden': {
      de: '/melden',
      it: '/segnala'
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
    }
  }
});

export type Locale = (typeof routing.locales)[number];
