import type {Locale} from '@/i18n/routing';
import type {ReportDraftValues} from './schema';

export function createDefaultReportValues(locale: Locale, mode: 'observation' | 'roadkill' = 'observation'): ReportDraftValues {
  return {
    reportKind: mode,
    // Bewusst keine Vorauswahl: die Beobachtungsart muss aktiv gewählt werden.
    observationType: mode === 'roadkill' ? 'dead' : undefined,
    // Keine erfundene Startposition: der Punkt muss aktiv gesetzt werden.
    latitude: undefined,
    longitude: undefined,
    municipality: undefined,
    locality: '',
    addressOrPlace: '',
    locationSource: 'map',
    observedDate: '',
    observedTimeFrom: '',
    observedTimeTo: '',
    timeAccuracy: 'exact',
    reporterFirstName: '',
    reporterLastName: '',
    reporterEmail: '',
    reporterPhone: '',
    preferredContact: 'either',
    individualCount: 1,
    animalVitalStatus: mode === 'roadkill' ? 'dead' : 'unknown',
    ageClass: 'unknown',
    sex: 'unknown',
    behaviors: [],
    behaviorOther: '',
    habitat: 'unknown',
    features: {
      robotMowerNearby: false,
      fenceNearby: false,
      roadNearby: false,
      poolOrShaftNearby: false,
      gardenPassagePresent: false,
      shelterPresent: false,
      waterSourcePresent: false,
      artificialLightingNearby: false,
      dogOrCatNearby: false
    },
    roadName: '',
    roadPosition: 'unknown',
    notes: '',
    contactConsent: false,
    scientificUseConsent: false,
    privacyNoticeConsent: false,
    scientificMediaUseApproved: false,
    publicMediaUseApproved: false,
    newsletterConsent: false,
    clientSubmissionId: crypto.randomUUID(),
    submittedLocale: locale
  };
}
