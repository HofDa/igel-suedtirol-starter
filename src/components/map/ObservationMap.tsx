'use client';

import maplibregl, {type GeoJSONSource, type Map} from 'maplibre-gl';
import {useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import type {PublicSighting} from '@/types/sighting';

export function ObservationMap() {
  const t = useTranslations('map');
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [sightings, setSightings] = useState<PublicSighting[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/sightings')
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => setSightings(data.sightings ?? []))
      .catch(() => setError(true));
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
      map.on('click', 'unclustered', (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const props = feature.properties as PublicSighting;
        const node = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = props.municipality || t('unknownMunicipality');
        const paragraph = document.createElement('p');
        paragraph.textContent = `${t(`types.${props.observationType}`)} · ${new Date(props.observedAt).toLocaleDateString()}`;
        const notice = document.createElement('small');
        notice.textContent = t('blurNotice');
        node.append(strong, paragraph, notice);
        new maplibregl.Popup().setLngLat(feature.geometry.coordinates as [number, number]).setDOMContent(node).addTo(map);
      });
    };

    if (map.isStyleLoaded()) render();
    else map.once('load', render);
  }, [sightings, t]);

  return (
    <div>
      <div ref={container} className="h-[520px] overflow-hidden rounded-3xl border border-emerald-950/15 bg-emerald-50" aria-label={t('ariaLabel')} />
      {error && <p className="mt-4 rounded-xl bg-amber-100 p-4 font-semibold">{t('loadError')}</p>}
      <div className="mt-5" aria-live="polite">
        <strong>{t('listTitle')}</strong>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {sightings.slice(0, 8).map((sighting) => (
            <li key={sighting.id} className="rounded-xl bg-white p-3 text-sm">
              {sighting.municipality || t('unknownMunicipality')} · {t(`types.${sighting.observationType}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
