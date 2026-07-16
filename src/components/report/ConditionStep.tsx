'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportDraftValues} from '@/lib/report/schema';

const behaviors = ['moving', 'foraging', 'roadCrossing', 'resting', 'dayActive', 'curled', 'visibleInjury', 'motionless', 'trapped'] as const;

export function ConditionStep() {
  const t = useTranslations('report');
  const {register, setValue, watch} = useFormContext<ReportDraftValues>();
  const count = watch('individualCount');

  function adjustCount(delta: number) {
    const current = Number.isFinite(count) ? count : 1;
    setValue('individualCount', Math.min(20, Math.max(1, current + delta)), {shouldValidate: true});
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.condition.title')}</h2>
      <label className="mt-6 block max-w-xs font-bold">
        {t('steps.condition.count')}
        <span className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => adjustCount(-1)} aria-label={t('steps.condition.decrease')} className="min-h-12 min-w-12 rounded-xl border border-emerald-950/20 bg-white text-xl font-black">−</button>
          <input type="number" min={1} max={20} {...register('individualCount', {valueAsNumber: true})} className="min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4 text-center" />
          <button type="button" onClick={() => adjustCount(1)} aria-label={t('steps.condition.increase')} className="min-h-12 min-w-12 rounded-xl border border-emerald-950/20 bg-white text-xl font-black">+</button>
        </span>
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
