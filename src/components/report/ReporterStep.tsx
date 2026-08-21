'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {Alert} from '@/components/ui/Alert';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import {Field, inputClass} from '@/components/ui/Field';
import type {ReportDraftValues} from '@/lib/report/schema';

export function ReporterStep() {
  const t = useTranslations('report');
  const {register, formState: {errors}} = useFormContext<ReportDraftValues>();

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.contact.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.contact.text')}</p>
      <Alert tone="note" className="mt-5">{t('steps.contact.privacy')}</Alert>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t('steps.contact.firstName')} error={errors.reporterFirstName && t('validation.firstName')}>
          {(field) => <input autoComplete="given-name" {...field} {...register('reporterFirstName')} className={inputClass()} />}
        </Field>
        <Field label={t('steps.contact.lastName')} error={errors.reporterLastName && t('validation.lastName')}>
          {(field) => <input autoComplete="family-name" {...field} {...register('reporterLastName')} className={inputClass()} />}
        </Field>
        <Field label={t('steps.contact.email')} error={errors.reporterEmail && t('validation.contact')}>
          {(field) => <input type="email" inputMode="email" autoComplete="email" {...field} {...register('reporterEmail')} className={inputClass()} />}
        </Field>
        <Field label={t('steps.contact.phone')} error={errors.reporterPhone && t('validation.contact')}>
          {(field) => <input type="tel" inputMode="tel" autoComplete="tel" {...field} {...register('reporterPhone')} className={inputClass()} />}
        </Field>
      </div>

      <fieldset className="mt-6">
        <legend className="font-semibold text-ink">{t('steps.contact.preferred')}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(['email', 'phone', 'either'] as const).map((value) => (
            <ChoiceCard key={value} type="radio" compact value={value} label={t(`steps.contact.preferredOptions.${value}`)} {...register('preferredContact')} />
          ))}
        </div>
        {errors.preferredContact && <Alert tone="danger" live="alert" className="mt-3">{t('validation.preferredContact')}</Alert>}
      </fieldset>
    </div>
  );
}
