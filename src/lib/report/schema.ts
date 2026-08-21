import {z} from 'zod';
import {municipalityIds} from '@/lib/locations/south-tyrol-municipalities';
import {isWithinSouthTyrolProjectArea} from '@/lib/locations/south-tyrol-municipalities';
import {ageClasses, behaviors, habitats, observationTypes, sexes} from '@/types/sighting';
import {getTodayInProjectTimeZone, isValidProjectLocalDateTime} from './date-time';

export {ageClasses, behaviors, habitats, observationTypes, sexes} from '@/types/sighting';

export function requiresSosNotice(observationType: string | undefined) {
  return observationType === 'injured';
}

const timeValue = z.union([z.literal(''), z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)]);
const optionalText = (max: number) => z.string().trim().max(max);

const completeReportSchema = z.object({
  reportKind: z.enum(['observation', 'roadkill']),
  observationType: z.enum(observationTypes),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().min(0).max(10000).optional(),
  locationSource: z.enum(['gps', 'map', 'address']),
  municipality: z.enum(municipalityIds),
  locality: optionalText(160),
  addressOrPlace: optionalText(240),
  observedDate: z.iso.date(),
  observedTimeFrom: timeValue,
  observedTimeTo: timeValue,
  timeAccuracy: z.enum(['exact', 'range', 'date_only']),
  reporterFirstName: z.string().trim().min(1).max(80),
  reporterLastName: z.string().trim().min(1).max(80),
  reporterEmail: z.union([z.literal(''), z.email()]),
  reporterPhone: optionalText(40),
  preferredContact: z.enum(['email', 'phone', 'either']),
  individualCount: z.number().int().min(1).max(20),
  animalVitalStatus: z.enum(['alive', 'dead', 'unknown']),
  ageClass: z.enum(ageClasses),
  sex: z.enum(sexes),
  behaviors: z.array(z.enum(behaviors)).max(17),
  behaviorOther: optionalText(300),
  habitat: z.enum(habitats),
  features: z.object({
    robotMowerNearby: z.boolean(),
    fenceNearby: z.boolean(),
    roadNearby: z.boolean(),
    poolOrShaftNearby: z.boolean(),
    gardenPassagePresent: z.boolean(),
    shelterPresent: z.boolean(),
    waterSourcePresent: z.boolean(),
    artificialLightingNearby: z.boolean(),
    dogOrCatNearby: z.boolean()
  }),
  roadName: optionalText(160),
  roadPosition: z.enum(['carriageway', 'roadside', 'embankment', 'unknown']),
  notes: z.string().max(1000).optional(),
  contactConsent: z.boolean(),
  scientificUseConsent: z.boolean().refine(Boolean, 'consent-required'),
  privacyNoticeConsent: z.boolean().refine(Boolean, 'privacy-consent-required'),
  scientificMediaUseApproved: z.boolean(),
  publicMediaUseApproved: z.boolean(),
  newsletterConsent: z.boolean(),
  clientSubmissionId: z.uuid(),
  submittedLocale: z.enum(['de', 'it'])
});

const draftReportSchema = completeReportSchema.extend({
  observationType: z.enum(observationTypes).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  municipality: z.enum(municipalityIds).optional()
});

export const reportSchema = draftReportSchema.pipe(completeReportSchema).superRefine((values, context) => {
  if (values.observedDate > getTodayInProjectTimeZone()) {
    context.addIssue({code: 'custom', path: ['observedDate'], message: 'future-observation-date'});
  }
  if (!isWithinSouthTyrolProjectArea(values.latitude, values.longitude)) {
    context.addIssue({code: 'custom', path: ['latitude'], message: 'outside-project-area'});
    context.addIssue({code: 'custom', path: ['longitude'], message: 'outside-project-area'});
  }
  if (values.timeAccuracy !== 'date_only' && (!values.observedTimeFrom || !isValidProjectLocalDateTime(values.observedDate, values.observedTimeFrom))) {
    context.addIssue({code: 'custom', path: ['observedTimeFrom'], message: 'invalid-observation-time'});
  }
  if (values.timeAccuracy === 'exact' && values.observedTimeTo) {
    context.addIssue({code: 'custom', path: ['observedTimeTo'], message: 'exact-time-has-no-end'});
  }
  if (values.timeAccuracy === 'range') {
    if (!values.observedTimeTo || !isValidProjectLocalDateTime(values.observedDate, values.observedTimeTo)) {
      context.addIssue({code: 'custom', path: ['observedTimeTo'], message: 'invalid-observation-time'});
    } else if (values.observedTimeFrom && values.observedTimeTo < values.observedTimeFrom) {
      context.addIssue({code: 'custom', path: ['observedTimeTo'], message: 'time-range-order'});
    }
  }
  if (values.timeAccuracy === 'date_only' && (values.observedTimeFrom || values.observedTimeTo)) {
    context.addIssue({code: 'custom', path: ['timeAccuracy'], message: 'date-only-with-time'});
  }
  if (!values.reporterEmail && !values.reporterPhone) {
    context.addIssue({code: 'custom', path: ['reporterEmail'], message: 'contact-required'});
    context.addIssue({code: 'custom', path: ['reporterPhone'], message: 'contact-required'});
  }
  if (values.preferredContact === 'email' && !values.reporterEmail) {
    context.addIssue({code: 'custom', path: ['preferredContact'], message: 'preferred-email-missing'});
  }
  if (values.preferredContact === 'phone' && !values.reporterPhone) {
    context.addIssue({code: 'custom', path: ['preferredContact'], message: 'preferred-phone-missing'});
  }
  if (values.behaviors.includes('other') && values.behaviorOther.length > 300) {
    context.addIssue({code: 'custom', path: ['behaviorOther'], message: 'behavior-other-too-long'});
  }
  if (values.reportKind === 'roadkill' && !values.roadName) {
    context.addIssue({code: 'custom', path: ['roadName'], message: 'road-name-required'});
  }
});

export type ReportDraftValues = z.input<typeof reportSchema>;
export type ReportSubmission = z.output<typeof reportSchema>;
