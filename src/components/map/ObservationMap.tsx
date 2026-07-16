'use client';

import maplibregl, {type GeoJSONSource, type Map} from 'maplibre-gl';
import {Loader2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import {publicSightingsResponseSchema} from '@/lib/sightings/public-schema';
import type {PublicSighting} from '@/types/sighting';

export function ObservationMap() {
  const t = useTranslations('map');
  const locale = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [sightings, setSightings] = useState<PublicSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/sightings')
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => setSightings(publicSightingsResponseSchema.parse(data).sightings))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://demotiles.maplibre.org/style.json',
      center: [11.35, 46.5],
      zoom: 7.2
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: sightings.map((sighting) => ({
        type: 'Feature',
        geometry: {type: 'Point', coordinates: [sighting.longitude, sighting.latitude]},
        properties: sighting
      }))
    };

    const render = () => {
      const existing = map.getSource('sightings') as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data);
        return;
      }
      map.addSource('sightings', {type: 'geojson', data, cluster: true, clusterMaxZoom: 13, clusterRadius: 45});
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'sightings',
        filter: ['has', 'point_count'],
        paint: {'circle-color': '#d78b35', 'circle-radius': ['step', ['get', 'point_count'], 17, 10, 23, 50, 30], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2}
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'sightings',
        filter: ['has', 'point_count'],
        layout: {'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13}
      });
      map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'sightings',
        filter: ['!', ['has', 'point_count']],
        paint: {'circle-color': '#234936', 'circle-radius': 8, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2}
      });
      map.on('click', 'clusters', (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const source = map.getSource('sightings') as GeoJSONSource;
        source.getClusterExpansionZoom(feature.properties?.cluster_id).then((zoom) => {
          map.easeTo({center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom});
        });
      });
      map.on('click', 'unclustered', (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const props = feature.properties as PublicSighting;
        const node = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = props.municipality || t('unknownMunicipality');
        const paragraph = document.createElement('p');
        paragraph.textContent = `${t(`types.${props.observationType}`)} · ${new Date(props.observedAt).toLocaleDateString(locale)}`;
        const notice = document.createElement('small');
        notice.textContent = t('blurNotice');
        node.append(strong, paragraph, notice);
        new maplibregl.Popup().setLngLat(feature.geometry.coordinates as [number, number]).setDOMContent(node).addTo(map);
      });
      for (const layer of ['clusters', 'unclustered']) {
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

  return (
    <div>
      <div className="relative">
        <div ref={container} className="h-[420px] overflow-hidden rounded-3xl border border-emerald-950/15 bg-emerald-50 md:h-[520px]" aria-label={t('ariaLabel')} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-emerald-50/70" role="status">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-emerald-950 shadow">
              <Loader2 className="animate-spin" size={18} aria-hidden="true" /> {t('loading')}
            </span>
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-x-4 top-4 rounded-xl bg-amber-100 p-4 font-semibold shadow" role="alert">{t('loadError')}</div>
        )}
        {!loading && !error && sightings.length === 0 && (
          <div className="absolute inset-x-4 top-4 rounded-xl bg-white/95 p-4 font-semibold shadow" role="status">{t('empty')}</div>
        )}
      </div>
      <div className="mt-5" aria-live="polite">
        <strong>{t('listTitle')}</strong>
        {listed.length > 0 && (
          <>
            <p className="mt-1 text-sm text-emerald-950/65">{t('listCount', {shown: listed.length, total: sightings.length})}</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {listed.map((sighting) => (
                <li key={sighting.id} className="rounded-xl bg-white p-3 text-sm">
                  {sighting.municipality || t('unknownMunicipality')} · {t(`types.${sighting.observationType}`)} ·{' '}
                  {new Date(sighting.observedAt).toLocaleDateString(locale)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
