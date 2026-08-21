'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import {Field, inputClass} from '@/components/ui/Field';
import {behaviors, type ReportDraftValues} from '@/lib/report/schema';

const DEAD_BEHAVIORS = ['motionless', 'unknown', 'other'] as const;

export function BehaviorStep() {
  const t = useTranslations('report');
  const {register, watch} = useFormContext<ReportDraftValues>();
  const type = watch('observationType');
  const selected = watch('behaviors') ?? [];
  const available = type === 'dead' ? DEAD_BEHAVIORS : behaviors;

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.behavior.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.behavior.text')}</p>
      <fieldset className="mt-6">
        <legend className="font-semibold text-ink">{t('steps.behavior.legend')}</legend>
        <p className="mt-1 text-caption text-ink-dim">{t('steps.behavior.hint')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {available.map((behavior) => <ChoiceCard key={behavior} type="checkbox" compact value={behavior} label={t(`behaviors.${behavior}`)} {...register('behaviors')} />)}
        </div>
      </fieldset>
      {selected.includes('other') && (
        <Field className="mt-5" label={t('steps.behavior.other')} optional optionalLabel={t('optional')}>
          {(field) => <input {...field} {...register('behaviorOther')} className={inputClass()} />}
        </Field>
      )}
    </div>
  );
}
