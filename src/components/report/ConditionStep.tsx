'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportFormValues} from '@/lib/report/schema';

const behaviors = ['moving', 'foraging', 'roadCrossing', 'resting', 'dayActive', 'curled', 'visibleInjury', 'motionless', 'trapped'] as const;

export function ConditionStep() {
  const t = useTranslations('report');
  const {register} = useFormContext<ReportFormValues>();

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.condition.title')}</h2>
      <label className="mt-6 block max-w-xs font-bold">
        {t('steps.condition.count')}
        <input type="number" min={1} max={20} {...register('individualCount', {valueAsNumber: true})} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
      </label>
      <fieldset className="mt-6">
        <legend className="font-bold">{t('steps.condition.behavior')}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {behaviors.map((behavior) => (
            <label key={behavior} className="flex min-h-12 items-center gap-3 rounded-xl border border-emerald-950/10 bg-white px-4">
              <input type="checkbox" value={behavior} {...register('behaviors')} className="h-5 w-5" />
              {t(`behaviors.${behavior}`)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
