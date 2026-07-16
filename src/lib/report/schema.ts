import {z} from 'zod';
import {habitats, observationTypes} from '@/types/sighting';
import {isValidProjectLocalDateTime} from './date-time';

export {habitats, observationTypes} from '@/types/sighting';

const completeReportSchema = z.object({
  observationType: z.enum(observationTypes),
  latitude: z.number().min(45).max(48),
  longitude: z.number().min(9).max(13),
  accuracy: z.number().min(0).max(10000).optional(),
  locationSource: z.enum(['gps', 'map', 'address']),
  observedDate: z.iso.date(),
  observedTime: z.union([z.literal(''), z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)]).optional(),
  timeUnknown: z.boolean(),
  individualCount: z.number().int().min(1).max(20),
  behaviors: z.array(z.string()).max(12),
  habitat: z.enum(habitats),
  features: z.object({
    robotMowerNearby: z.boolean(),
    fenceNearby: z.boolean(),
    roadNearby: z.boolean(),
    poolOrShaftNearby: z.boolean(),
    gardenPassagePresent: z.boolean(),
    shelterPresent: z.boolean(),
    waterSourcePresent: z.boolean()
  }),
  notes: z.string().max(1000).optional(),
  reporterName: z.string().max(120).optional(),
  reporterEmail: z.union([z.literal(''), z.email()]).optional(),
  contactConsent: z.boolean(),
  scientificUseConsent: z.boolean().refine(Boolean, 'consent-required'),
  photoPublicationConsent: z.boolean(),
  newsletterConsent: z.boolean(),
  clientSubmissionId: z.uuid(),
  submittedLocale: z.enum(['de', 'it'])
});

const draftReportSchema = completeReportSchema.extend({
  observationType: z.enum(observationTypes).optional(),
  latitude: z.number().min(45).max(48).optional(),
  longitude: z.number().min(9).max(13).optional()
});

export const reportSchema = draftReportSchema.pipe(completeReportSchema).superRefine((values, context) => {
  if (!values.timeUnknown && (!values.observedTime || !isValidProjectLocalDateTime(values.observedDate, values.observedTime))) {
    context.addIssue({code: 'custom', path: ['observedTime'], message: 'invalid-observation-time'});
  }
  if ((values.reporterName || values.reporterEmail) && !values.contactConsent) {
    context.addIssue({code: 'custom', path: ['contactConsent'], message: 'contact-consent-required'});
  }
});

export type ReportDraftValues = z.input<typeof reportSchema>;
export type ReportSubmission = z.output<typeof reportSchema>;
