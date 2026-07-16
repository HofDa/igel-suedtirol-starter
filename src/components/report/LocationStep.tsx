'use client';

import {LocateFixed} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import type {ReportFormValues} from '@/lib/report/schema';

export function LocationStep() {
  const t = useTranslations('report');
  const {register, setValue, watch, formState: {errors}} = useFormContext<ReportFormValues>();
  const [status, setStatus] = useState<string>();
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const accuracy = watch('accuracy');

  function locate() {
    if (!navigator.geolocation) {
      setStatus(t('steps.location.unsupported'));
      return;
    }
    setStatus(t('steps.location.locating'));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude, {shouldValidate: true});
        setValue('longitude', position.coords.longitude, {shouldValidate: true});
        setValue('accuracy', position.coords.accuracy);
        setValue('locationSource', 'gps');
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
      <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm">
        <strong>{t('steps.location.current')}:</strong> {latitude.toFixed(5)}, {longitude.toFixed(5)}
        {accuracy ? ` · ±${Math.round(accuracy)} m` : ''}
      </div>
    </div>
  );
}
