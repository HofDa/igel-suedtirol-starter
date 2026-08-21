import { describe, expect, it } from 'vitest';
import type { PublicSighting } from '@/types/sighting';
import { PUBLIC_GRID_METRES, toClusterPoints, toPublicGridCells } from './public-observations';

const sighting: PublicSighting = {
  id: 'public-1',
  occurrenceId: 'IGEL-2026-000001',
  observationType: 'alive',
  observedAt: '2026-08-20T20:00:00+02:00',
  municipality: 'Bozen',
  latitude: 46.5,
  longitude: 11.35,
  roadkill: false,
};

describe('public map geometry', () => {
  it('renders a closed 500 metre cell around the public location', () => {
    const collection = toPublicGridCells([sighting]);
    const feature = collection.features[0];

    expect(PUBLIC_GRID_METRES).toBe(500);
    expect(feature.geometry.type).toBe('Polygon');
    if (feature.geometry.type !== 'Polygon') return;

    const ring = feature.geometry.coordinates[0];
    expect(ring).toHaveLength(5);
    expect(ring[0]).toEqual(ring[4]);
    expect(ring[0][0]).toBeLessThan(sighting.longitude);
    expect(ring[2][0]).toBeGreaterThan(sighting.longitude);
    expect(ring[0][1]).toBeLessThan(sighting.latitude);
    expect(ring[2][1]).toBeGreaterThan(sighting.latitude);
  });

  it('uses public locations as cluster points without changing their properties', () => {
    const collection = toClusterPoints([sighting]);

    expect(collection.features[0]).toMatchObject({
      geometry: { type: 'Point', coordinates: [11.35, 46.5] },
      properties: { id: 'public-1', municipality: 'Bozen' },
    });
  });
});
