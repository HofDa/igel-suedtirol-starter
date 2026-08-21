export const observationTypes = ['alive', 'injured', 'dead', 'trace', 'uncertain'] as const;
export const habitats = [
  'settlement',
  'settlement_edge',
  'private_garden',
  'public_park',
  'agricultural_area',
  'orchard',
  'vineyard',
  'meadow_or_pasture',
  'forest',
  'forest_edge_or_hedge',
  'wetland_or_water_edge',
  'road_outside_settlement',
  'parking_area',
  'industrial_area',
  'other',
  'unknown'
] as const;
export const behaviors = [
  'moving',
  'foraging',
  'feeding',
  'road_crossing',
  'resting',
  'sleeping',
  'curled_up',
  'interacting',
  'day_active',
  'lethargic',
  'disoriented',
  'visibly_injured',
  'fleeing',
  'motionless',
  'trapped',
  'unknown',
  'other'
] as const;
export const ageClasses = ['adult', 'young_of_year', 'unknown'] as const;
export const sexes = ['female', 'male', 'unknown'] as const;

export type ObservationType = (typeof observationTypes)[number];
export type Habitat = (typeof habitats)[number];
export type Behavior = (typeof behaviors)[number];
export type AgeClass = (typeof ageClasses)[number];
export type Sex = (typeof sexes)[number];

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
