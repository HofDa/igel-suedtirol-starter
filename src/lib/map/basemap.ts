import type { StyleSpecification } from 'maplibre-gl';
import { SOUTH_TYROL_PROJECT_BOUNDS } from '@/lib/locations/south-tyrol-municipalities';

/**
 * Grundkarte der Anwendung.
 *
 * Die Kacheln kommen vom amtlichen Geodienst der Autonomen Provinz Bozen –
 * Südtirol. Das ist bewusst kein kommerzielles Kartennetz:
 *
 * - Es ist die zuständige amtliche Quelle für genau das Gebiet, das dieses
 *   Projekt abdeckt, und offen zugänglich (WMTS meldet „Fees: none",
 *   „AccessConstraints: none").
 * - Es braucht keinen Schlüssel. Damit liegt kein Zugangstoken im Client.
 * - Die einfarbige Fassung ist absichtlich blass. Die Meldungen liegen in
 *   Blüte-Pink darüber und müssen die lautesten Elemente der Karte bleiben.
 *
 * Der bisherige Vorgabewert `demotiles.maplibre.org` war der Demo-Server des
 * MapLibre-Projekts. Er ist ausdrücklich nicht für den Produktivbetrieb
 * gedacht und antwortete zuletzt mit HTTP 429 – die Karte blieb deshalb leer.
 */
const PROVINCE_TILES =
  'https://geoservices.buergernetz.bz.it/mapproxy/root/wmts' +
  '/p_bz-BaseMap:Basemap-Monochromatic/EPSG_3857/{z}/{x}/{y}.jpeg';

/** Amtliche Kachelpyramide bis Maßstab ~1:1000. */
const MAX_TILE_ZOOM = 18;

/**
 * Der Kartenausschnitt ist derselbe, den `reportSchema` für Meldungen
 * zulässt. Außerhalb davon liefert der Provinzdienst ohnehin nichts, und ein
 * Meldepunkt dort wäre nicht gültig – die Karte lässt also gar nicht erst
 * dorthin wandern.
 */
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [SOUTH_TYROL_PROJECT_BOUNDS.west, SOUTH_TYROL_PROJECT_BOUNDS.south],
  [SOUTH_TYROL_PROJECT_BOUNDS.east, SOUTH_TYROL_PROJECT_BOUNDS.north],
];

/**
 * Baut den Stil als Objekt statt ihn als `style.json` zu laden: eine
 * Netzanfrage weniger vor dem ersten Bild, und die Quellenangabe steht
 * zusammen mit der Quelle.
 *
 * `NEXT_PUBLIC_MAP_STYLE_URL` bleibt als Ausweg bestehen. Ist die Variable
 * gesetzt, gewinnt sie – dann verantwortet der Betrieb Quelle und
 * Quellenangabe selbst.
 */
export function buildBasemapStyle(attribution: string): StyleSpecification | string {
  const override = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  if (override) return override;

  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: [PROVINCE_TILES],
        tileSize: 256,
        maxzoom: MAX_TILE_ZOOM,
        attribution,
      },
    },
    layers: [
      // Der Kartengrund liegt unter allen Meldungsebenen und trägt selbst
      // keine Farbe des Designsystems – er ist Hintergrund, nicht Aussage.
      { id: 'basemap', type: 'raster', source: 'basemap' },
    ],
  };
}
