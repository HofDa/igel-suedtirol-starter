'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClass } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Readout } from '@/components/ui/Readout';
import { publicEnv } from '@/lib/env';
import { createDefaultReportValues } from '@/lib/report/defaults';
import { reportSchema, type ReportDraftValues, type ReportSubmission } from '@/lib/report/schema';
import { ObservationTypeStep } from './ObservationTypeStep';
import { LocationStep } from './LocationStep';
import { DateTimeStep } from './DateTimeStep';
import { AnimalStep } from './AnimalStep';
import { BehaviorStep } from './BehaviorStep';
import { ReporterStep } from './ReporterStep';
import { HabitatStep } from './HabitatStep';
import { PhotoStep } from './PhotoStep';
import { ConsentStep } from './ConsentStep';
import { StepTransport } from './StepTransport';
import { useReportDraft } from './useReportDraft';
import {
  OBSERVATION_REPORT_STEPS,
  ROADKILL_REPORT_STEPS,
  useReportNavigation,
} from './useReportNavigation';

export function ReportWizard({ mode = 'observation' }: { mode?: 'observation' | 'roadkill' }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('report');
  const defaults = useMemo(() => createDefaultReportValues(locale, mode), [locale, mode]);
  const steps = mode === 'roadkill' ? ROADKILL_REPORT_STEPS : OBSERVATION_REPORT_STEPS;
  const methods = useForm<ReportDraftValues, unknown, ReportSubmission>({
    resolver: zodResolver(reportSchema),
    defaultValues: defaults,
    mode: 'onTouched',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    occurrenceId: string;
    persisted: boolean;
    mediaStored: boolean;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const { step, stepContainer, next, back, goTo, restoreStep, resetStep } = useReportNavigation(
    methods,
    steps,
  );
  const { restoredAt, mediaDraftError, discard, finalize } = useReportDraft({
    methods,
    defaults,
    locale,
    step,
    restoreStep,
    resetStep,
    files,
    restoreFiles: setFiles,
  });

  function discardDraft() {
    discard().catch(() => undefined);
    setFiles([]);
  }

  async function submit(values: ReportSubmission) {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      if (files.length > 0 && !values.scientificMediaUseApproved) {
        methods.setError('scientificMediaUseApproved', { type: 'manual' });
        setSubmitError(t('mediaConsentError'));
        return;
      }
      type SubmissionResponse =
        | {
            occurrenceId: string;
            persisted: boolean;
            mediaStored?: boolean;
            photoStored?: boolean;
          }
        | { error?: string };
      let data: SubmissionResponse;
      if (publicEnv.staticExport) {
        data = {
          occurrenceId: `DEMO-${values.clientSubmissionId}`,
          persisted: false,
          mediaStored: true,
        };
      } else {
        const body = new FormData();
        body.set('payload', JSON.stringify(values));
        files.forEach((file) => body.append('media', file));
        const response = await fetch('/api/sightings', { method: 'POST', body });
        data = (await response.json()) as SubmissionResponse;
        if (!response.ok) {
          const error = 'error' in data ? data.error : undefined;
          const messageKey =
            error === 'rate-limit-exceeded'
              ? 'rateLimitError'
              : error && ['request-too-large', 'file-too-large'].includes(error)
                ? 'requestTooLargeError'
                : 'submitError';
          setSubmitError(t(messageKey));
          return;
        }
      }
      if (!('occurrenceId' in data)) {
        setSubmitError(t('submitError'));
        return;
      }
      setResult({
        occurrenceId: data.occurrenceId,
        persisted: Boolean(data.persisted),
        mediaStored: data.mediaStored !== false && data.photoStored !== false,
      });
      await finalize();
    } catch {
      setSubmitError(t('submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto text-success" size={48} aria-hidden="true" />
        <h2 className="mt-5 text-display font-semibold text-ink">{t('success.title')}</h2>
        <p className="mx-auto mt-3 max-w-prose text-lead text-ink-dim">{t('success.text')}</p>

        <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-panel border border-line bg-well px-5 py-3">
          <Readout label={t('success.occurrenceId')}>{result.occurrenceId}</Readout>
        </div>

        <div className="mt-6 grid gap-3 text-left">
          {!result.persisted && <Alert tone="provisional">{t('success.demo')}</Alert>}
          {!result.mediaStored && <Alert tone="danger">{t('success.mediaFailed')}</Alert>}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              discardDraft();
              setResult(null);
            }}
          >
            {t('success.another')}
          </Button>
          <Link href="/karte" className={buttonClass('outline')}>
            {t('success.map')}
          </Link>
        </div>
      </Panel>
    );
  }

  const isLastStep = step === steps.length;
  const currentStep = steps[step - 1];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} noValidate>
        <Panel className="mx-auto max-w-3xl p-6 md:p-10">
          <StepTransport current={step} steps={steps} />

          {restoredAt && (
            <Alert
              tone="note"
              live="status"
              className="mt-5"
              action={
                <Button tone="outline" size="md" onClick={discardDraft}>
                  {t('draft.discard')}
                </Button>
              }
            >
              {t('draft.restored', { date: new Date(restoredAt).toLocaleDateString(locale) })}
            </Alert>
          )}

          {mediaDraftError && (
            <Alert tone="provisional" live="status" className="mt-5">
              {t('draft.mediaNotSaved')}
            </Alert>
          )}

          {/* Der einzige inszenierte Bewegungsmoment: der Lichtkegel wandert
              auf den neuen Schritt. Inhalt ist dabei nie unsichtbar. */}
          <div key={step} ref={stepContainer} className="step-in mt-8 scroll-mt-24">
            {currentStep.key === 'type' && <ObservationTypeStep />}
            {currentStep.key === 'time' && <DateTimeStep />}
            {currentStep.key === 'contact' && <ReporterStep />}
            {currentStep.key === 'location' && <LocationStep />}
            {currentStep.key === 'animal' && <AnimalStep roadkill={mode === 'roadkill'} />}
            {currentStep.key === 'behavior' && <BehaviorStep />}
            {currentStep.key === 'habitat' && <HabitatStep />}
            {currentStep.key === 'media' && <PhotoStep files={files} onFiles={setFiles} />}
            {currentStep.key === 'consent' && (
              <ConsentStep files={files} steps={steps} onGoTo={goTo} />
            )}
          </div>

          {submitError && (
            <Alert tone="danger" live="alert" className="mt-6">
              {submitError}
            </Alert>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button tone="quiet" onClick={back} disabled={step === 1 || submitting}>
              <ArrowLeft size={18} aria-hidden="true" /> {t('back')}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep.optional && !isLastStep && (
                <Button tone="quiet" onClick={next}>
                  {t('skip')}
                </Button>
              )}
              {isLastStep ? (
                <Button as="button" type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send size={18} aria-hidden="true" />
                  )}
                  {t('submit')}
                </Button>
              ) : (
                <Button onClick={next}>
                  {t('next')} <ArrowRight size={18} aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </form>
    </FormProvider>
  );
}
