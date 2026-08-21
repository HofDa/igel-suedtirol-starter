import {z} from 'zod';
import {isWithinSouthTyrolProjectArea, municipalityIds} from '@/lib/locations/south-tyrol-municipalities';

export const roadHazardTypes = [
  'frequent_hedgehog_crossings', 'multiple_roadkills', 'high_vehicle_speed',
  'barrier_or_wall', 'missing_passage', 'poor_visibility', 'road_drain_or_shaft', 'other'
] as const;

export const roadHazardSchema = z.object({
  municipality: z.enum(municipalityIds),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().min(0).max(10000).optional(),
  roadName: z.string().trim().min(1).max(160),
  locality: z.string().trim().max(160),
  hazardTypes: z.array(z.enum(roadHazardTypes)).min(1).max(8),
  description: z.string().trim().min(1).max(2000),
  reporterFirstName: z.string().trim().min(1).max(80),
  reporterLastName: z.string().trim().min(1).max(80),
  reporterEmail: z.union([z.literal(''), z.email()]),
  reporterPhone: z.string().trim().max(40),
  preferredContact: z.enum(['email', 'phone', 'either']),
  scientificUseConsent: z.boolean().refine(Boolean, 'consent-required'),
  privacyNoticeConsent: z.boolean().refine(Boolean, 'consent-required'),
  clientSubmissionId: z.uuid(),
  submittedLocale: z.enum(['de', 'it'])
}).superRefine((values, context) => {
  if (!isWithinSouthTyrolProjectArea(values.latitude, values.longitude)) {
    context.addIssue({code: 'custom', path: ['latitude'], message: 'outside-project-area'});
  }
  if (!values.reporterEmail && !values.reporterPhone) {
    context.addIssue({code: 'custom', path: ['reporterEmail'], message: 'contact-required'});
    context.addIssue({code: 'custom', path: ['reporterPhone'], message: 'contact-required'});
  }
  if (values.preferredContact === 'email' && !values.reporterEmail) context.addIssue({code: 'custom', path: ['preferredContact'], message: 'preferred-email-missing'});
  if (values.preferredContact === 'phone' && !values.reporterPhone) context.addIssue({code: 'custom', path: ['preferredContact'], message: 'preferred-phone-missing'});
});

export type RoadHazardSubmission = z.infer<typeof roadHazardSchema>;
