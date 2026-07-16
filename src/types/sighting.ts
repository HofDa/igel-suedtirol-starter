export const observationTypes = ['alive', 'injured', 'dead', 'trace', 'uncertain'] as const;
export const habitats = [
  'private_garden',
  'settlement',
  'public_park',
  'road',
  'parking_area',
  'orchard',
  'vineyard',
  'meadow',
  'forest_edge',
  'forest',
  'water_edge',
  'other',
  'unknown'
] as const;

export type ObservationType = (typeof observationTypes)[number];
export type Habitat = (typeof habitats)[number];

export type PublicSighting = {
  id: string;
  occurrenceId: string;
  observationType: ObservationType;
  observedAt: string;
  municipality?: string;
  habitat?: Habitat;
  latitude: number;
  longitude: number;
  roadkill: boolean;
};
