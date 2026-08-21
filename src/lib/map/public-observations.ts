import type { PublicSighting } from '@/types/sighting';

/** Kantenlänge der veröffentlichten, absichtlich ungenauen Rasterzelle. */
export const PUBLIC_GRID_METRES = 500;

/**
 * Baut für jede veröffentlichte Position die dazugehörige Rasterfläche.
 * Öffentlich wird bewusst nie ein vermeintlich exakter Fundpunkt gezeigt.
 */
export function toPublicGridCells(sightings: PublicSighting[]): GeoJSON.FeatureCollection {
  const half = PUBLIC_GRID_METRES / 2;

  return {
    type: 'FeatureCollection',
    features: sightings.map((sighting) => {
      const latitudeSpan = half / 111_320;
      const longitudeSpan = half / (111_320 * Math.cos((sighting.latitude * Math.PI) / 180));
      const west = sighting.longitude - longitudeSpan;
      const east = sighting.longitude + longitudeSpan;
      const south = sighting.latitude - latitudeSpan;
      const north = sighting.latitude + latitudeSpan;

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
        properties: { ...sighting },
      };
    }),
  };
}

/** Punkte dienen ausschließlich der Bündelung in kleinen Zoomstufen. */
export function toClusterPoints(sightings: PublicSighting[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: sightings.map((sighting) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [sighting.longitude, sighting.latitude] },
      properties: { ...sighting },
    })),
  };
}
