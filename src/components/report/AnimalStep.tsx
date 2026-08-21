'use client';

import {Minus, Plus} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {buttonClass} from '@/components/ui/Button';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import {Field, inputClass} from '@/components/ui/Field';
import {ageClasses, sexes, type ReportDraftValues} from '@/lib/report/schema';

export function AnimalStep({roadkill = false}: {roadkill?: boolean}) {
  const t = useTranslations('report');
  const {register, setValue, watch, formState: {errors}} = useFormContext<ReportDraftValues>();
  const count = watch('individualCount');
  const observationType = watch('observationType');
  const vitalStatusNeeded = !roadkill && (observationType === 'trace' || observationType === 'uncertain');

  function adjustCount(delta: number) {
    const current = Number.isFinite(count) ? count : 1;
    setValue('individualCount', Math.min(20, Math.max(1, current + delta)), {shouldValidate: true, shouldDirty: true});
  }

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t(`steps.animal.${roadkill ? 'roadkillTitle' : 'title'}`)}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t(`steps.animal.${roadkill ? 'roadkillText' : 'text'}`)}</p>

      {roadkill && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t('steps.animal.roadName')} error={errors.roadName && t('validation.roadName')}>
            {(field) => <input {...field} {...register('roadName')} className={inputClass()} />}
          </Field>
          <Field label={t('steps.animal.roadPosition')}>
            {(field) => (
              <select {...field} {...register('roadPosition')} className={inputClass()}>
                {(['carriageway', 'roadside', 'embankment', 'unknown'] as const).map((value) => (
                  <option key={value} value={value}>{t(`steps.animal.roadPositions.${value}`)}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <label htmlFor="individual-count" className="font-semibold text-ink">{t('steps.animal.count')}</label>
        <div className="flex max-w-56 items-center gap-2">
          <button type="button" onClick={() => adjustCount(-1)} aria-label={t('steps.animal.decrease')} className={buttonClass('outline', 'lg', 'aspect-square shrink-0 px-0')}>
            <Minus size={18} aria-hidden="true" />
          </button>
          <input id="individual-count" type="number" inputMode="numeric" min={1} max={20} {...register('individualCount', {valueAsNumber: true})} className={inputClass('readout text-center')} />
          <button type="button" onClick={() => adjustCount(1)} aria-label={t('steps.animal.increase')} className={buttonClass('outline', 'lg', 'aspect-square shrink-0 px-0')}>
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
        {errors.individualCount && <p role="alert" className="text-caption font-medium text-danger">{t('validation.count')}</p>}
      </div>

      {vitalStatusNeeded && (
        <fieldset className="mt-8">
          <legend className="font-semibold text-ink">{t('steps.animal.vitalStatus')}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(['alive', 'dead', 'unknown'] as const).map((value) => <ChoiceCard key={value} type="radio" compact value={value} label={t(`steps.animal.vitalStatuses.${value}`)} {...register('animalVitalStatus')} />)}
          </div>
        </fieldset>
      )}

      {!roadkill && (
        <div className="mt-8 grid gap-7 sm:grid-cols-2">
          <fieldset>
            <legend className="font-semibold text-ink">{t('steps.animal.age')}</legend>
            <div className="mt-3 grid gap-2">{ageClasses.map((value) => <ChoiceCard key={value} type="radio" compact value={value} label={t(`ageClasses.${value}`)} {...register('ageClass')} />)}</div>
          </fieldset>
          <fieldset>
            <legend className="font-semibold text-ink">{t('steps.animal.sex')}</legend>
            <div className="mt-3 grid gap-2">{sexes.map((value) => <ChoiceCard key={value} type="radio" compact value={value} label={t(`sexes.${value}`)} {...register('sex')} />)}</div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
