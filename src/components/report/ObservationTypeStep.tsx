'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportFormValues} from '@/lib/report/schema';
import {observationTypes} from '@/lib/report/schema';

const icons: Record<(typeof observationTypes)[number], string> = {
  alive: '🦔',
  injured: '⚠️',
  dead: '✚',
  trace: '👣',
  uncertain: '❓'
};

export function ObservationTypeStep() {
  const t = useTranslations('report');
  const {register, watch, formState: {errors}} = useFormContext<ReportFormValues>();
  const value = watch('observationType');

  return (
    <fieldset>
      <legend className="text-2xl font-black text-emerald-950">{t('steps.type.title')}</legend>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {observationTypes.map((type) => (
          <label key={type} className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 font-bold transition ${value === type ? 'border-amber-600 bg-amber-50' : 'border-emerald-950/10 bg-white hover:border-emerald-800/30'}`}>
            <input type="radio" value={type} {...register('observationType')} className="sr-only" />
            <span className="text-3xl" aria-hidden="true">{icons[type]}</span>
            {t(`observationTypes.${type}`)}
          </label>
        ))}
      </div>
      {errors.observationType && (
        <p className="mt-3 text-sm font-bold text-red-700" role="alert">{t('validation.observationType')}</p>
      )}
      {value === 'injured' && (
        <p className="mt-5 rounded-xl border border-red-700/20 bg-red-50 p-4 font-semibold text-red-900">{t('steps.type.injuredNotice')}</p>
      )}
    </fieldset>
  );
}
