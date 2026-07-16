export type PublicSighting = {
  id: string;
  occurrenceId: string;
  observationType: 'alive' | 'injured' | 'dead' | 'trace' | 'uncertain';
  observedAt: string;
  municipality?: string;
  habitat?: string;
  latitude: number;
  longitude: number;
  roadkill: boolean;
};
