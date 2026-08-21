'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {Alert} from '@/components/ui/Alert';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import {controlClass, Field} from '@/components/ui/Field';
import type {ReportDraftValues} from '@/lib/report/schema';
import {ReportSummary} from './ReportSummary';

type Props = {
  files: File[];
  steps: Parameters<typeof ReportSummary>[0]['steps'];
  onGoTo: (step: number) => void;
};

export function ConsentStep({files, steps, onGoTo}: Props) {
  const t = useTranslations('report');
  const {
    register,
    formState: {errors}
  } = useFormContext<ReportDraftValues>();

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.consent.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.consent.text')}</p>

      <div className="mt-6">
        <ReportSummary files={files} steps={steps} onGoTo={onGoTo} />
      </div>

      <Field className="mt-8" label={t('steps.consent.notes')} optional optionalLabel={t('optional')} hint={t('steps.consent.notesHint')}>
        {(field) => <textarea rows={4} {...field} {...register('notes')} className={controlClass('py-3')} />}
      </Field>

      <fieldset className="mt-8">
        <legend className="font-semibold text-ink">{t('steps.consent.permissionsLegend')}</legend>
        <div className="mt-3 grid gap-2">
          <ChoiceCard
            type="checkbox"
            label={t('steps.consent.science')}
            description={t('steps.consent.scienceHint')}
            aria-invalid={errors.scientificUseConsent ? true : undefined}
            {...register('scientificUseConsent')}
          />
          {errors.scientificUseConsent && (
            <Alert tone="danger" live="alert">
              {t('validation.consent')}
            </Alert>
          )}
          <ChoiceCard type="checkbox" label={t('steps.consent.privacyNoticeConsent')} aria-invalid={errors.privacyNoticeConsent ? true : undefined} {...register('privacyNoticeConsent')} />
          {errors.privacyNoticeConsent && <Alert tone="danger" live="alert">{t('validation.consent')}</Alert>}
          <ChoiceCard type="checkbox" label={t('steps.consent.contactConsent')} {...register('contactConsent')} />
          {files.length > 0 && <ChoiceCard type="checkbox" label={t('steps.consent.scientificMediaUseApproved')} description={t('steps.consent.scientificMediaHint')} aria-invalid={errors.scientificMediaUseApproved ? true : undefined} {...register('scientificMediaUseApproved')} />}
          <ChoiceCard type="checkbox" label={t('steps.consent.publicMediaUseApproved')} description={t('steps.consent.publicMediaHint')} {...register('publicMediaUseApproved')} />
          <ChoiceCard type="checkbox" label={t('steps.consent.newsletterConsent')} {...register('newsletterConsent')} />
        </div>
      </fieldset>
    </div>
  );
}
