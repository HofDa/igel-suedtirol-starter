'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {ArrowLeft, ArrowRight, CheckCircle2, Loader2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useMemo, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import type {Locale} from '@/i18n/routing';
import {createDefaultReportValues} from '@/lib/report/defaults';
import {reportSchema, type ReportDraftValues, type ReportSubmission} from '@/lib/report/schema';
import {ObservationTypeStep} from './ObservationTypeStep';
import {LocationStep} from './LocationStep';
import {DateTimeStep} from './DateTimeStep';
import {ConditionStep} from './ConditionStep';
import {HabitatStep} from './HabitatStep';
import {PhotoStep} from './PhotoStep';
import {ConsentStep} from './ConsentStep';
import {ReportProgress} from './ReportProgress';
import {Link} from '@/i18n/navigation';
import {useReportDraft} from './useReportDraft';
import {REPORT_STEP_COUNT, useReportNavigation} from './useReportNavigation';

export function ReportWizard() {
  const locale = useLocale() as Locale;
  const t = useTranslations('report');
  const defaults = useMemo(() => createDefaultReportValues(locale), [locale]);
  const methods = useForm<ReportDraftValues, unknown, ReportSubmission>({
    resolver: zodResolver(reportSchema),
    defaultValues: defaults,
    mode: 'onTouched'
  });
  const [file, setFile] = useState<File>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{occurrenceId: string; persisted: boolean; photoStored: boolean} | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const {step, stepContainer, next, back, restoreStep, resetStep} = useReportNavigation(methods);
  const {restoredAt, discard, finalize} = useReportDraft({methods, defaults, locale, step, restoreStep, resetStep});

  function discardDraft() {
    discard().catch(() => undefined);
    setFile(undefined);
  }

  async function submit(values: ReportSubmission) {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const body = new FormData();
      body.set('payload', JSON.stringify(values));
      if (file) body.set('photo', file);
      const response = await fetch('/api/sightings', {method: 'POST', body});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'submission-failed');
      setResult({
        occurrenceId: data.occurrenceId,
        persisted: Boolean(data.persisted),
        photoStored: data.photoStored !== false
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
      <div className="card mx-auto max-w-2xl p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto text-emerald-700" size={64} aria-hidden="true" />
        <h2 className="mt-5 text-3xl font-black text-emerald-950">{t('success.title')}</h2>
        <p className="mt-3 text-lg">{t('success.text', {id: result.occurrenceId})}</p>
        {!result.persisted && <p className="mt-5 rounded-xl bg-amber-100 p-4 font-bold text-amber-950">{t('success.demo')}</p>}
        {!result.photoStored && <p className="mt-5 rounded-xl bg-amber-100 p-4 font-bold text-amber-950">{t('success.photoFailed')}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => {discardDraft(); setResult(null);}} className="rounded-full bg-emerald-900 px-6 py-3 font-bold text-white">{t('success.another')}</button>
          <Link href="/karte" className="rounded-full border border-emerald-900 px-6 py-3 font-bold">{t('success.map')}</Link>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="card mx-auto max-w-3xl p-6 md:p-10">
        <ReportProgress current={step} total={REPORT_STEP_COUNT} label={t('progress', {current: step, total: REPORT_STEP_COUNT})} />
        {restoredAt && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-sm" role="status">
            <span className="font-semibold">
              {t('draft.restored', {date: new Date(restoredAt).toLocaleDateString(locale)})}
            </span>
            <button type="button" onClick={discardDraft} className="min-h-11 rounded-full border border-emerald-900 px-4 py-2 font-bold">
              {t('draft.discard')}
            </button>
          </div>
        )}
        <div ref={stepContainer} className="mt-9 min-h-[340px] scroll-mt-28">
          {step === 1 && <ObservationTypeStep />}
          {step === 2 && <LocationStep />}
          {step === 3 && <DateTimeStep />}
          {step === 4 && <ConditionStep />}
          {step === 5 && <HabitatStep />}
          {step === 6 && <PhotoStep file={file} onFile={setFile} />}
          {step === 7 && <ConsentStep />}
        </div>
        {submitError && <p className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-800" role="alert">{submitError}</p>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-emerald-950/10 pt-6">
          <button type="button" disabled={step === 1 || submitting} onClick={back} className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-bold disabled:opacity-30">
            <ArrowLeft aria-hidden="true" /> {t('back')}
          </button>
          {step < REPORT_STEP_COUNT ? (
            <button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-900 px-6 font-bold text-white">
              {t('next')} <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-600 px-6 font-black text-emerald-950 disabled:opacity-60">
              {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {t('submit')}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
