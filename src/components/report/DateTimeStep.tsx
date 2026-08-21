'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {Button} from '@/components/ui/Button';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import {Field, inputClass} from '@/components/ui/Field';
import type {ReportDraftValues} from '@/lib/report/schema';
import {getTodayInProjectTimeZone} from '@/lib/report/date-time';

export function DateTimeStep() {
  const t = useTranslations('report');
  const {
    register, setValue,
    watch,
    formState: {errors}
  } = useFormContext<ReportDraftValues>();
  const accuracy = watch('timeAccuracy');

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.time.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.time.text')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t('steps.time.date')} error={errors.observedDate && t('validation.date')}>
          {(field) => (
            <span className="flex flex-wrap gap-2">
              <input type="date" max={getTodayInProjectTimeZone()} {...field} {...register('observedDate')} className={inputClass('min-w-48 flex-1')} />
              <Button tone="outline" size="md" onClick={() => setValue('observedDate', getTodayInProjectTimeZone(), {shouldDirty: true, shouldValidate: true})}>
                {t('steps.time.today')}
              </Button>
            </span>
          )}
        </Field>
        <fieldset>
          <legend className="font-semibold text-ink">{t('steps.time.accuracy')}</legend>
          <div className="mt-2 grid gap-2">
            {(['exact', 'range', 'date_only'] as const).map((value) => (
              <ChoiceCard key={value} type="radio" compact value={value} label={t(`steps.time.accuracies.${value}`)} {...register('timeAccuracy')} />
            ))}
          </div>
        </fieldset>
        <Field
          label={accuracy === 'range' ? t('steps.time.timeFrom') : t('steps.time.time')}
          hint={accuracy === 'date_only' ? t('steps.time.unknownActive') : undefined}
          error={errors.observedTimeFrom && t('validation.time')}
        >
          {(field) => (
            <input
              type="time"
              disabled={accuracy === 'date_only'}
              {...field}
              {...register('observedTimeFrom')}
              className={inputClass()}
            />
          )}
        </Field>
        {accuracy === 'range' && (
          <Field label={t('steps.time.timeTo')} error={errors.observedTimeTo && t('validation.timeRange')}>
            {(field) => <input type="time" {...field} {...register('observedTimeTo')} className={inputClass()} />}
          </Field>
        )}
      </div>
    </div>
  );
}
