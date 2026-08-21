import type {PublicSighting} from '@/types/sighting';

export const demoSightings: PublicSighting[] = [
  {id: '1', occurrenceId: 'IGEL-2026-000101', observationType: 'alive', observedAt: '2026-07-12T21:15:00+02:00', municipality: 'Meran', habitat: 'private_garden', latitude: 46.67, longitude: 11.16, roadkill: false},
  {id: '2', occurrenceId: 'IGEL-2026-000102', observationType: 'dead', observedAt: '2026-07-10T06:30:00+02:00', municipality: 'Bozen', habitat: 'road_outside_settlement', latitude: 46.5, longitude: 11.35, roadkill: true},
  {id: '3', occurrenceId: 'IGEL-2026-000103', observationType: 'alive', observedAt: '2026-07-08T22:00:00+02:00', municipality: 'Kaltern', habitat: 'vineyard', latitude: 46.41, longitude: 11.24, roadkill: false},
  {id: '4', occurrenceId: 'IGEL-2026-000104', observationType: 'injured', observedAt: '2026-07-06T20:20:00+02:00', municipality: 'Brixen', habitat: 'settlement', latitude: 46.72, longitude: 11.66, roadkill: false}
];
