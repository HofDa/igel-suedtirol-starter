'use client';

import maplibregl, {type Map as MapLibreMap, type Marker} from 'maplibre-gl';
import {LocateFixed} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import type {ReportFormValues} from '@/lib/report/schema';

const SOUTH_TYROL_CENTER: [number, number] = [11.35, 46.5];

export function LocationStep() {
  const t = useTranslations('report');
  const {register, setValue, getValues, watch, formState: {errors}} = useFormContext<ReportFormValues>();
  const [status, setStatus] = useState<string>();
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const accuracy = watch('accuracy');
  const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);

  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  function applyPosition(lat: number, lng: number, source: ReportFormValues['locationSource'], acc?: number) {
    setValue('latitude', lat, {shouldValidate: true, shouldDirty: true});
    setValue('longitude', lng, {shouldValidate: true, shouldDirty: true});
    setValue('accuracy', acc);
    setValue('locationSource', source);
  }

  function placeMarker(lng: number, lat: number) {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      const marker = new maplibregl.Marker({draggable: true, color: '#d78b35'});
      marker.setLngLat([lng, lat]).addTo(map);
      marker.on('dragend', () => {
        const position = marker.getLngLat();
        applyPosition(position.lat, position.lng, 'map');
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
  }

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const initialLatitude = getValues('latitude');
    const initialLongitude = getValues('longitude');
    const initialPosition = Number.isFinite(initialLatitude) && Number.isFinite(initialLongitude);
    const map = new maplibregl.Map({
      container: container.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? 'https://demotiles.maplibre.org/style.json',
      center: initialPosition ? [initialLongitude, initialLatitude] : SOUTH_TYROL_CENTER,
      zoom: initialPosition ? 14 : 7.2
    });
    map.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');
    map.on('click', (event) => {
      applyPosition(event.lngLat.lat, event.lngLat.lng, 'map');
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      placeMarker(longitude, latitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  function locate() {
    if (!navigator.geolocation) {
      setStatus(t('steps.location.unsupported'));
      return;
    }
    setStatus(t('steps.location.locating'));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyPosition(position.coords.latitude, position.coords.longitude, 'gps', position.coords.accuracy);
        mapRef.current?.flyTo({center: [position.coords.longitude, position.coords.latitude], zoom: 15});
        setStatus(t('steps.location.success'));
      },
      () => setStatus(t('steps.location.failed')),
      {enableHighAccuracy: true, timeout: 12000, maximumAge: 30000}
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.location.title')}</h2>
      <p className="mt-2 text-emerald-950/70">{t('steps.location.text')}</p>
      <button type="button" onClick={locate} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-900 px-5 font-bold text-white">
        <LocateFixed aria-hidden="true" /> {t('steps.location.button')}
      </button>
      {status && <p className="mt-3 text-sm font-semibold" role="status">{status}</p>}
      <div
        ref={container}
        className="mt-5 h-64 overflow-hidden rounded-2xl border border-emerald-950/15 bg-emerald-50 md:h-80"
        aria-label={t('steps.location.mapAria')}
      />
      <p className="mt-2 text-sm text-emerald-950/65">{t('steps.location.mapHint')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="font-bold">
          {t('steps.location.latitude')}
          <input type="number" step="any" {...register('latitude', {valueAsNumber: true})} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
          {errors.latitude && <span className="mt-1 block text-sm text-red-700">{t('validation.coordinates')}</span>}
        </label>
        <label className="font-bold">
          {t('steps.location.longitude')}
          <input type="number" step="any" {...register('longitude', {valueAsNumber: true})} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
          {errors.longitude && <span className="mt-1 block text-sm text-red-700">{t('validation.coordinates')}</span>}
        </label>
      </div>
      <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm" aria-live="polite">
        {hasPosition ? (
          <>
            <strong>{t('steps.location.current')}:</strong> {latitude.toFixed(5)}, {longitude.toFixed(5)}
            {accuracy ? ` · ±${Math.round(accuracy)} m` : ''}
          </>
        ) : (
          <strong>{t('steps.location.noPosition')}</strong>
        )}
      </div>
    </div>
  );
}
