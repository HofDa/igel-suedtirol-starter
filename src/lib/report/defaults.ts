import type {Locale} from '@/i18n/routing';
import {getDefaultObservationDateTime} from './date-time';
import type {ReportDraftValues} from './schema';

export function createDefaultReportValues(locale: Locale): ReportDraftValues {
  const {date, time} = getDefaultObservationDateTime();

  return {
    // Bewusst keine Vorauswahl: die Beobachtungsart muss aktiv gewählt werden.
    observationType: undefined,
    // Keine erfundene Startposition: der Punkt muss aktiv gesetzt werden.
    latitude: undefined,
    longitude: undefined,
    locationSource: 'map',
    observedDate: date,
    observedTime: time,
    timeUnknown: false,
    individualCount: 1,
    behaviors: [],
    habitat: 'unknown',
    features: {
      robotMowerNearby: false,
      fenceNearby: false,
      roadNearby: false,
      poolOrShaftNearby: false,
      gardenPassagePresent: false,
      shelterPresent: false,
      waterSourcePresent: false
    },
    notes: '',
    reporterName: '',
    reporterEmail: '',
    contactConsent: false,
    scientificUseConsent: false,
    photoPublicationConsent: false,
    newsletterConsent: false,
    submittedLocale: locale
  };
}
