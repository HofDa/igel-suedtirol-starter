'use client';

import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { Loader2, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { publicEnv } from '@/lib/env';
import { MAP_MAX_BOUNDS, buildBasemapStyle } from '@/lib/map/basemap';
import {
  PUBLIC_GRID_METRES,
  toClusterPoints,
  toPublicGridCells,
} from '@/lib/map/public-observations';
import { publicSightingsResponseSchema } from '@/lib/sightings/public-schema';
import { demoSightings } from '@/lib/sightings/demo';
import type { PublicSighting } from '@/types/sighting';

const SOUTH_TYROL_CENTER: [number, number] = [11.35, 46.5];
const INITIAL_ZOOM = 7.2;

function mapColour(container: HTMLElement, token: string) {
  return getComputedStyle(container).getPropertyValue(token).trim();
}

async function fetchPublicSightings(signal?: AbortSignal) {
  if (publicEnv.staticExport) return demoSightings;
  const response = await fetch('/api/sightings', { signal });
  if (!response.ok) throw new Error();
  const data: unknown = await response.json();
  return publicSightingsResponseSchema.parse(data).sightings;
}

export function ObservationMap() {
  const t = useTranslations('map');
  const locale = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [sightings, setSightings] = useState<PublicSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSightings = useCallback(() => {
    setLoading(true);
    setError(false);

    fetchPublicSightings()
      .then(setSightings)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublicSightings(controller.signal)
      .then(setSightings)
      .catch((loadError: unknown) => {
        if (!(loadError instanceof DOMException && loadError.name === 'AbortError')) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Als String aus dem Effekt herausgezogen: `t` ist zwischen Renderdurchläufen
  // nicht garantiert identisch, die Zeichenkette schon. Sonst würde die Karte
  // bei jedem Render neu aufgebaut.
  const attribution = t('attribution');

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: buildBasemapStyle(attribution),
      center: SOUTH_TYROL_CENTER,
      zoom: INITIAL_ZOOM,
      // Außerhalb Südtirols hat der Provinzdienst keine Kacheln – und eine
      // Meldung dort wäre ohnehin ungültig.
      maxBounds: MAP_MAX_BOUNDS,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [attribution]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const clusterData = toClusterPoints(sightings);
    const cellData = toPublicGridCells(sightings);

    const render = () => {
      const clusterSource = map.getSource('sightings') as GeoJSONSource | undefined;
      const cellSource = map.getSource('sighting-cells') as GeoJSONSource | undefined;
      if (clusterSource && cellSource) {
        clusterSource.setData(clusterData);
        cellSource.setData(cellData);
        return;
      }

      map.addSource('sightings', {
        type: 'geojson',
        data: clusterData,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 45,
      });
      map.addSource('sighting-cells', { type: 'geojson', data: cellData });

      const accent = mapColour(map.getContainer(), '--accent');
      const outline = mapColour(map.getContainer(), '--ink');

      // Ab Zoom 12 die tatsächliche 500-m-Zelle, darunter Bündelungen.
      map.addLayer({
        id: 'cells-fill',
        type: 'fill',
        source: 'sighting-cells',
        minzoom: 12,
        paint: { 'fill-color': accent, 'fill-opacity': 0.22 },
      });
      map.addLayer({
        id: 'cells-outline',
        type: 'line',
        source: 'sighting-cells',
        minzoom: 12,
        paint: { 'line-color': outline, 'line-width': 1.5 },
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'sightings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': accent,
          'circle-opacity': 0.85,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 29],
          'circle-stroke-color': outline,
          'circle-stroke-width': 1.5,
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'sightings',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': outline },
      });
      map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'sightings',
        filter: ['!', ['has', 'point_count']],
        maxzoom: 12,
        paint: {
          'circle-color': accent,
          'circle-radius': 7,
          'circle-stroke-color': outline,
          'circle-stroke-width': 1.5,
        },
      });

      map.on('click', 'clusters', (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const source = map.getSource('sightings') as GeoJSONSource;
        source.getClusterExpansionZoom(feature.properties?.cluster_id).then((zoom) => {
          map.easeTo({
            center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom,
          });
        });
      });

      const openPopup = (props: PublicSighting, coordinates: [number, number]) => {
        const node = document.createElement('div');
        node.className = 'map-observation-popup';
        const strong = document.createElement('strong');
        strong.textContent = props.municipality || t('unknownMunicipality');
        const paragraph = document.createElement('p');
        paragraph.textContent = `${t(`types.${props.observationType}`)} · ${new Date(props.observedAt).toLocaleDateString(locale)}`;
        const notice = document.createElement('small');
        notice.textContent = t('blurNotice');
        node.append(strong, paragraph, notice);
        new maplibregl.Popup({ maxWidth: '280px' })
          .setLngLat(coordinates)
          .setDOMContent(node)
          .addTo(map);
      };

      map.on('click', 'unclustered', (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        openPopup(
          feature.properties as PublicSighting,
          feature.geometry.coordinates as [number, number],
        );
      });
      map.on('click', 'cells-fill', (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        openPopup(feature.properties as PublicSighting, [event.lngLat.lng, event.lngLat.lat]);
      });

      for (const layer of ['clusters', 'unclustered', 'cells-fill']) {
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    if (map.isStyleLoaded()) render();
    else map.once('load', render);
  }, [sightings, locale, t]);

  const listed = sightings.slice(0, 8);

  const resetMap = () => {
    mapRef.current?.easeTo({ center: SOUTH_TYROL_CENTER, zoom: INITIAL_ZOOM });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-title font-semibold text-ink">{t('mapTitle')}</h2>
            <p className="mt-1 text-caption text-ink-dim">{t('mapHint')}</p>
          </div>
          <Button tone="outline" size="md" onClick={resetMap}>
            <RotateCcw size={16} aria-hidden="true" />
            {t('resetView')}
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-card border border-line bg-well shadow-lifted">
          <div
            ref={container}
            className="h-[min(62svh,34rem)] min-h-[24rem] w-full"
            aria-label={t('ariaLabel')}
          />

          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-ground/70"
              role="status"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-caption font-medium shadow-lifted">
                <Loader2 className="animate-spin text-primary-deep" size={16} aria-hidden="true" />{' '}
                {t('loading')}
              </span>
            </div>
          )}

          {!loading && error && (
            <Alert
              tone="danger"
              live="alert"
              className="absolute inset-x-4 top-4 shadow-lifted"
              action={
                <Button tone="outline" size="md" onClick={loadSightings}>
                  {t('retry')}
                </Button>
              }
            >
              {t('loadError')}
            </Alert>
          )}

          {!loading && !error && sightings.length === 0 && (
            <Alert tone="note" live="status" className="absolute inset-x-4 top-4 shadow-lifted">
              {t('empty')}
            </Alert>
          )}
        </div>

        {/* Die Legende macht die absichtliche Ortsunschärfe unmittelbar sichtbar. */}
        <div className="mt-4 grid gap-3 rounded-panel bg-well px-4 py-4 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2 text-caption text-ink-dim">
            <span aria-hidden="true" className="size-4 rounded-full border border-ink bg-accent" />
            {t('legend.cluster')}
          </span>
          <span className="inline-flex items-center gap-2 text-caption text-ink-dim">
            <span aria-hidden="true" className="size-4 border border-ink bg-accent/30" />
            {t('legend.cell', { metres: PUBLIC_GRID_METRES })}
          </span>
          <span className="text-caption text-ink-faint sm:col-span-2">{t('legend.note')}</span>
        </div>
      </div>

      <section className="lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-title font-semibold text-ink">{t('listTitle')}</h2>
        {listed.length > 0 ? (
          <>
            <p className="mt-1 text-caption text-ink-faint">
              {t('listCount', { shown: listed.length, total: sightings.length })}
            </p>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
              {listed.map((sighting) => (
                <li key={sighting.id} className="grid gap-1 px-4 py-3">
                  <span className="font-semibold text-ink">
                    {sighting.municipality || t('unknownMunicipality')}
                  </span>
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-caption text-ink-dim">
                      {t(`types.${sighting.observationType}`)}
                    </span>
                    <span className="readout text-ink-faint">
                      {new Date(sighting.observedAt).toLocaleDateString(locale)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          !loading && <p className="mt-2 text-caption text-ink-dim">{t('listEmpty')}</p>
        )}
      </section>
    </div>
  );
}
