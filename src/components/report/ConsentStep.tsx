'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportFormValues} from '@/lib/report/schema';

export function ConsentStep() {
  const t = useTranslations('report');
  const {register, formState: {errors}} = useFormContext<ReportFormValues>();
  const optionalConsents = ['contactConsent', 'photoPublicationConsent', 'newsletterConsent'] as const;

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.consent.title')}</h2>
      <p className="mt-2 text-emerald-950/70">{t('steps.consent.text')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="font-bold">
          {t('steps.consent.name')}
          <input type="text" {...register('reporterName')} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
        </label>
        <label className="font-bold">
          {t('steps.consent.email')}
          <input type="email" {...register('reporterEmail')} className="mt-2 min-h-12 w-full rounded-xl border border-emerald-950/20 bg-white px-4" />
        </label>
      </div>
      <label className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-950/10 bg-white p-4 font-semibold">
        <input type="checkbox" {...register('scientificUseConsent')} className="mt-1 h-5 w-5" />
        <span>{t('steps.consent.science')}</span>
      </label>
      {errors.scientificUseConsent && <p className="mt-2 text-sm font-bold text-red-700">{t('validation.consent')}</p>}
      {optionalConsents.map((field) => (
        <label key={field} className="mt-3 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 font-semibold">
          <input type="checkbox" {...register(field)} className="mt-1 h-5 w-5" />
          <span>{t(`steps.consent.${field}`)}</span>
        </label>
      ))}
      <label className="mt-6 block font-bold">
        {t('steps.consent.notes')}
        <textarea rows={4} {...register('notes')} className="mt-2 w-full rounded-xl border border-emerald-950/20 bg-white p-4" />
      </label>
    </div>
  );
}
