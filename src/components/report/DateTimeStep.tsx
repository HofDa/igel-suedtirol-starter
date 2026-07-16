'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportDraftValues} from '@/lib/report/schema';

export function DateTimeStep() {
  const t = useTranslations('report');
  const {register, watch, formState: {errors}} = useFormContext<ReportDraftValues>();
  const unknown = watch('timeUnknown');

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.time.title')}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="font-bold">
          {t('steps.time.date')}
          <input type="date" {...register('observedDate')} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
          {errors.observedDate && <span className="mt-1 block text-sm text-red-700">{t('validation.date')}</span>}
        </label>
        <label className="font-bold">
          {t('steps.time.time')}
          <input type="time" disabled={unknown} {...register('observedTime')} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4 disabled:opacity-50" />
        </label>
      </div>
      <label className="mt-5 flex min-h-11 items-center gap-3 font-semibold">
        <input type="checkbox" {...register('timeUnknown')} className="h-5 w-5" />
        {t('steps.time.unknown')}
      </label>
    </div>
  );
}
