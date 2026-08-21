'use client';

import maplibregl, {type Map as MapLibreMap, type Marker} from 'maplibre-gl';
import {LocateFixed} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useEffect, useRef, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {Alert} from '@/components/ui/Alert';
import {Button} from '@/components/ui/Button';
import {Field, inputClass} from '@/components/ui/Field';
import {Readout} from '@/components/ui/Readout';
import type {ReportDraftValues} from '@/lib/report/schema';
import {southTyrolMunicipalities} from '@/lib/locations/south-tyrol-municipalities';
import {MAP_MAX_BOUNDS, buildBasemapStyle} from '@/lib/map/basemap';

const SOUTH_TYROL_CENTER: [number, number] = [11.35, 46.5];
/** Marken-Pink – dieselbe Farbe wie die Kartendaten auf der öffentlichen Karte. */
const MARKER_COLOR = '#fb8cdb';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function LocationStep() {
  const t = useTranslations('report');
  const attribution = useTranslations('map')('attribution');
  const locale = useLocale() as 'de' | 'it';
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: {errors}
  } = useFormContext<ReportDraftValues>();
  const [status, setStatus] = useState<{tone: 'note' | 'danger' | 'success'; text: string}>();
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const accuracy = watch('accuracy');
  const source = watch('locationSource');

  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  function applyPosition(lat: number, lng: number, nextSource: ReportDraftValues['locationSource'], acc?: number) {
    setValue('latitude', lat, {shouldValidate: true, shouldDirty: true});
    setValue('longitude', lng, {shouldValidate: true, shouldDirty: true});
    setValue('accuracy', acc);
    setValue('locationSource', nextSource);
  }

  function placeMarker(lng: number, lat: number) {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      const marker = new maplibregl.Marker({draggable: true, color: MARKER_COLOR});
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
    const initialPosition = isFiniteNumber(initialLatitude) && isFiniteNumber(initialLongitude);
    const map = new maplibregl.Map({
      container: container.current,
      style: buildBasemapStyle(attribution),
      center: initialPosition ? [initialLongitude, initialLatitude] : SOUTH_TYROL_CENTER,
      zoom: initialPosition ? 14 : 7.2,
      // Ein Klick außerhalb Südtirols kann keine gültige Meldung erzeugen;
      // die Karte lässt gar nicht erst dorthin wandern.
      maxBounds: MAP_MAX_BOUNDS
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
    if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
      placeMarker(longitude, latitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  function locate() {
    if (!navigator.geolocation) {
      setStatus({tone: 'danger', text: t('steps.location.unsupported')});
      return;
    }
    setStatus({tone: 'note', text: t('steps.location.locating')});
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyPosition(position.coords.latitude, position.coords.longitude, 'gps', position.coords.accuracy);
        mapRef.current?.flyTo({center: [position.coords.longitude, position.coords.latitude], zoom: 15});
        setStatus({tone: 'success', text: t('steps.location.success')});
      },
      () => setStatus({tone: 'danger', text: t('steps.location.failed')}),
      {enableHighAccuracy: true, timeout: 12000, maximumAge: 30000}
    );
  }

  const hasPosition = isFiniteNumber(latitude) && isFiniteNumber(longitude);

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.location.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.location.text')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t('steps.location.municipality')} error={errors.municipality && t('validation.municipality')}>
          {(field) => (
            <select {...field} {...register('municipality')} className={inputClass()} defaultValue="">
              <option value="" disabled>{t('steps.location.municipalityPlaceholder')}</option>
              {southTyrolMunicipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>{municipality[locale]}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t('steps.location.locality')} optional optionalLabel={t('optional')}>
          {(field) => <input {...field} {...register('locality')} className={inputClass()} />}
        </Field>
        <Field className="sm:col-span-2" label={t('steps.location.addressOrPlace')} optional optionalLabel={t('optional')}>
          {(field) => <input autoComplete="street-address" {...field} {...register('addressOrPlace')} className={inputClass()} />}
        </Field>
      </div>

      <Button onClick={locate} className="mt-5">
        <LocateFixed size={18} aria-hidden="true" /> {t('steps.location.button')}
      </Button>

      {status && (
        <Alert tone={status.tone} live={status.tone === 'danger' ? 'alert' : 'status'} className="mt-3">
          {status.text}
        </Alert>
      )}

      <div
        ref={container}
        className="mt-5 h-64 overflow-hidden rounded-panel border border-line bg-well md:h-80"
        aria-label={t('steps.location.mapAria')}
      />
      <p className="mt-2 text-caption text-ink-faint">{t('steps.location.mapHint')}</p>

      {/* Die aufgenommene Position als Messwert, damit sie prüfbar ist. */}
      <div
        className="mt-4 flex flex-wrap items-end justify-between gap-4 rounded-panel border border-line bg-well px-4 py-3"
        aria-live="polite"
      >
        {hasPosition ? (
          <>
            <Readout label={t('steps.location.latitude')}>{latitude.toFixed(5)}</Readout>
            <Readout label={t('steps.location.longitude')}>{longitude.toFixed(5)}</Readout>
            <Readout label={t('steps.location.accuracy')}>
              {accuracy ? `±${Math.round(accuracy)} m` : '—'} · {t(`steps.location.sources.${source ?? 'map'}`)}
            </Readout>
          </>
        ) : (
          <p className="text-caption font-medium text-ink-dim">{t('steps.location.noPosition')}</p>
        )}
      </div>

      <details className="group mt-4">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-caption font-medium text-ink-dim hover:text-ink">
          {t('steps.location.manualToggle')}
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label={t('steps.location.latitude')} error={errors.latitude && t('validation.coordinates')}>
            {(field) => (
              <input
                type="number"
                step="any"
                inputMode="decimal"
                {...field}
                {...register('latitude', {valueAsNumber: true})}
                className={inputClass('readout')}
              />
            )}
          </Field>
          <Field label={t('steps.location.longitude')} error={errors.longitude && t('validation.coordinates')}>
            {(field) => (
              <input
                type="number"
                step="any"
                inputMode="decimal"
                {...field}
                {...register('longitude', {valueAsNumber: true})}
                className={inputClass('readout')}
              />
            )}
          </Field>
        </div>
      </details>

      <Alert tone="note" className="mt-5">
        {t('steps.location.privacy')}
      </Alert>
    </div>
  );
}
