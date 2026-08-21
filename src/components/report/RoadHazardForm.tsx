'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LocateFixed, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Field, controlClass, inputClass } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { publicEnv } from '@/lib/env';
import { southTyrolMunicipalities } from '@/lib/locations/south-tyrol-municipalities';
import {
  roadHazardSchema,
  roadHazardTypes,
  type RoadHazardSubmission,
} from '@/lib/road-hazards/schema';

export function RoadHazardForm() {
  const locale = useLocale() as 'de' | 'it';
  const t = useTranslations('roadHazard');
  const [result, setResult] = useState<{ number: string; persisted: boolean }>();
  const [status, setStatus] = useState<string>();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoadHazardSubmission>({
    resolver: zodResolver(roadHazardSchema),
    defaultValues: {
      locality: '',
      hazardTypes: [],
      reporterFirstName: '',
      reporterLastName: '',
      reporterEmail: '',
      reporterPhone: '',
      preferredContact: 'either',
      scientificUseConsent: false,
      privacyNoticeConsent: false,
      clientSubmissionId: crypto.randomUUID(),
      submittedLocale: locale,
    },
  });

  function locate() {
    if (!navigator.geolocation) return setStatus(t('locationUnsupported'));
    setStatus(t('locating'));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude, { shouldValidate: true });
        setValue('longitude', position.coords.longitude, { shouldValidate: true });
        setValue('accuracy', position.coords.accuracy);
        setStatus(t('locationSuccess'));
      },
      () => setStatus(t('locationFailed')),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function submit(values: RoadHazardSubmission) {
    setStatus(undefined);
    if (publicEnv.staticExport) {
      setResult({ number: `DEMO-STRASSE-${values.clientSubmissionId}`, persisted: false });
      return;
    }
    const response = await fetch('/api/road-hazards', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) return setStatus(t('submitError'));
    setResult({ number: data.reportNumber, persisted: Boolean(data.persisted) });
  }

  if (result)
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-success" size={46} aria-hidden="true" />
        <h2 className="mt-4 text-title font-semibold text-ink">{t('successTitle')}</h2>
        <p className="mt-2 text-ink-dim">{t('successText', { number: result.number })}</p>
        {!result.persisted && (
          <Alert tone="provisional" className="mt-5 text-left">
            {t('demoNotice')}
          </Alert>
        )}
      </Panel>
    );

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Panel className="mx-auto max-w-3xl p-6 md:p-10">
        <h2 className="text-section font-semibold text-ink">{t('locationTitle')}</h2>
        <p className="mt-2 text-ink-dim">{t('locationText')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t('municipality')} error={errors.municipality && t('validation')}>
            {(field) => (
              <select
                {...field}
                {...register('municipality')}
                defaultValue=""
                className={inputClass()}
              >
                <option value="" disabled>
                  {t('municipalityPlaceholder')}
                </option>
                {southTyrolMunicipalities.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry[locale]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t('roadName')} error={errors.roadName && t('validation')}>
            {(field) => <input {...field} {...register('roadName')} className={inputClass()} />}
          </Field>
          <Field label={t('locality')} optional optionalLabel={t('optional')}>
            {(field) => <input {...field} {...register('locality')} className={inputClass()} />}
          </Field>
        </div>
        <Button onClick={locate} tone="outline" className="mt-5">
          <LocateFixed size={18} aria-hidden="true" />
          {t('useLocation')}
        </Button>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t('latitude')} error={errors.latitude && t('coordinatesError')}>
            {(field) => (
              <input
                type="number"
                step="any"
                inputMode="decimal"
                {...field}
                {...register('latitude', { valueAsNumber: true })}
                className={inputClass('readout')}
              />
            )}
          </Field>
          <Field label={t('longitude')} error={errors.longitude && t('coordinatesError')}>
            {(field) => (
              <input
                type="number"
                step="any"
                inputMode="decimal"
                {...field}
                {...register('longitude', { valueAsNumber: true })}
                className={inputClass('readout')}
              />
            )}
          </Field>
        </div>
        <fieldset className="mt-8">
          <legend className="font-semibold text-ink">{t('hazardsTitle')}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {roadHazardTypes.map((type) => (
              <ChoiceCard
                key={type}
                type="checkbox"
                compact
                value={type}
                label={t(`types.${type}`)}
                {...register('hazardTypes')}
              />
            ))}
          </div>
          {errors.hazardTypes && (
            <p role="alert" className="mt-2 text-caption font-medium text-danger">
              {t('hazardsError')}
            </p>
          )}
        </fieldset>
        <Field
          className="mt-6"
          label={t('description')}
          error={errors.description && t('validation')}
        >
          {(field) => (
            <textarea
              rows={5}
              {...field}
              {...register('description')}
              className={controlClass('py-3')}
            />
          )}
        </Field>
        <h2 className="mt-10 text-title font-semibold text-ink">{t('contactTitle')}</h2>
        <Alert tone="note" className="mt-3">
          {t('privacy')}
        </Alert>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={t('firstName')} error={errors.reporterFirstName && t('validation')}>
            {(field) => (
              <input
                autoComplete="given-name"
                {...field}
                {...register('reporterFirstName')}
                className={inputClass()}
              />
            )}
          </Field>
          <Field label={t('lastName')} error={errors.reporterLastName && t('validation')}>
            {(field) => (
              <input
                autoComplete="family-name"
                {...field}
                {...register('reporterLastName')}
                className={inputClass()}
              />
            )}
          </Field>
          <Field label={t('email')} error={errors.reporterEmail && t('contactError')}>
            {(field) => (
              <input
                type="email"
                inputMode="email"
                {...field}
                {...register('reporterEmail')}
                className={inputClass()}
              />
            )}
          </Field>
          <Field label={t('phone')} error={errors.reporterPhone && t('contactError')}>
            {(field) => (
              <input
                type="tel"
                inputMode="tel"
                {...field}
                {...register('reporterPhone')}
                className={inputClass()}
              />
            )}
          </Field>
        </div>
        <fieldset className="mt-6">
          <legend className="font-semibold text-ink">{t('preferred')}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(['email', 'phone', 'either'] as const).map((value) => (
              <ChoiceCard
                key={value}
                type="radio"
                compact
                value={value}
                label={t(`preferredOptions.${value}`)}
                {...register('preferredContact')}
              />
            ))}
          </div>
        </fieldset>
        <div className="mt-8 grid gap-2">
          <ChoiceCard
            type="checkbox"
            label={t('scienceConsent')}
            aria-invalid={errors.scientificUseConsent ? true : undefined}
            {...register('scientificUseConsent')}
          />
          <ChoiceCard
            type="checkbox"
            label={t('privacyConsent')}
            aria-invalid={errors.privacyNoticeConsent ? true : undefined}
            {...register('privacyNoticeConsent')}
          />
        </div>
        {status && (
          <Alert tone="danger" live="alert" className="mt-5">
            {status}
          </Alert>
        )}
        <Button
          as="button"
          type="submit"
          size="lg"
          className="mt-8 w-full sm:w-auto"
          disabled={isSubmitting}
        >
          <Send size={18} aria-hidden="true" />
          {t('submit')}
        </Button>
      </Panel>
    </form>
  );
}
