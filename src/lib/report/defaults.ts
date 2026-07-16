import type {Locale} from '@/i18n/routing';
import type {ReportFormValues} from './schema';

export function createDefaultReportValues(locale: Locale): ReportFormValues {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  return {
    observationType: 'alive',
    latitude: 46.5,
    longitude: 11.35,
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
