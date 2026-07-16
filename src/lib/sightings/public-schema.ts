import {z} from 'zod';
import {habitats, observationTypes} from '@/types/sighting';

export const publicSightingSchema = z.object({
  id: z.string(),
  occurrenceId: z.string(),
  observationType: z.enum(observationTypes),
  observedAt: z.string(),
  municipality: z.string().optional(),
  habitat: z.enum(habitats).optional(),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  roadkill: z.boolean()
});

export const publicSightingsResponseSchema = z.object({
  sightings: z.array(publicSightingSchema)
});
