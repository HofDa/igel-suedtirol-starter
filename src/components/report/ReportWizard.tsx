'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {ArrowLeft, ArrowRight, CheckCircle2, Loader2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useEffect, useMemo, useRef, useState} from 'react';
import {FormProvider, useForm, type FieldPath} from 'react-hook-form';
import type {Locale} from '@/i18n/routing';
import {clearDraft, loadDraft, saveDraft} from '@/lib/offline/drafts';
import {createDefaultReportValues} from '@/lib/report/defaults';
import {reportSchema, type ReportFormValues} from '@/lib/report/schema';
import {ObservationTypeStep} from './ObservationTypeStep';
import {LocationStep} from './LocationStep';
import {DateTimeStep} from './DateTimeStep';
import {ConditionStep} from './ConditionStep';
import {HabitatStep} from './HabitatStep';
import {PhotoStep} from './PhotoStep';
import {ConsentStep} from './ConsentStep';
import {ReportProgress} from './ReportProgress';
import {Link} from '@/i18n/navigation';

const totalSteps = 7;

export function ReportWizard() {
  const locale = useLocale() as Locale;
  const t = useTranslations('report');
  const defaults = useMemo(() => createDefaultReportValues(locale), [locale]);
  const methods = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: defaults,
    mode: 'onTouched'
  });
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{occurrenceId: string; persisted: boolean} | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const [draftHydrated, setDraftHydrated] = useState(false);
  const stepContainer = useRef<HTMLDivElement>(null);
  const stepChangedByUser = useRef(false);

  useEffect(() => {
    if (!stepChangedByUser.current) return;
    stepChangedByUser.current = false;
    const heading = stepContainer.current?.querySelector<HTMLElement>('h2, legend');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll: true});
    }
    stepContainer.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, [step]);

  useEffect(() => {
    loadDraft()
      .then((draft) => {
        if (draft) {
          methods.reset({...draft.values, submittedLocale: locale});
          setStep(Math.min(Math.max(draft.step, 1), totalSteps));
        }
      })
      .catch(() => undefined)
      .finally(() => setDraftHydrated(true));
  }, [locale, methods]);

  useEffect(() => {
    if (!draftHydrated) return;
    const subscription = methods.watch((values) => {
      const merged = {
        ...defaults,
        ...values,
        features: {...defaults.features, ...(values.features ?? {})}
      } as ReportFormValues;
      saveDraft({
        values: merged,
        step,
        updatedAt: new Date().toISOString()
      }).catch(() => undefined);
    });
    return () => subscription.unsubscribe();
  }, [defaults, draftHydrated, methods, step]);

  const stepFields: Record<number, FieldPath<ReportFormValues>[]> = {
    1: ['observationType'],
    2: ['latitude', 'longitude', 'locationSource'],
    3: ['observedDate', 'observedTime', 'timeUnknown'],
    4: ['individualCount', 'behaviors'],
    5: ['habitat', 'features'],
    6: [],
    7: ['reporterName', 'reporterEmail', 'scientificUseConsent']
  };

  async function next() {
    const valid = await methods.trigger(stepFields[step], {shouldFocus: true});
    if (valid) {
      stepChangedByUser.current = true;
      setStep((value) => Math.min(value + 1, totalSteps));
    }
  }

  function back() {
    stepChangedByUser.current = true;
    setStep((value) => Math.max(value - 1, 1));
  }

  async function submit(values: ReportFormValues) {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const body = new FormData();
      body.set('payload', JSON.stringify(values));
      if (file) body.set('photo', file);
      const response = await fetch('/api/sightings', {method: 'POST', body});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'submission-failed');
      setResult({occurrenceId: data.occurrenceId, persisted: Boolean(data.persisted)});
      await clearDraft();
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
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => {methods.reset(defaults); setStep(1); setFile(undefined); setResult(null);}} className="rounded-full bg-emerald-900 px-6 py-3 font-bold text-white">{t('success.another')}</button>
          <Link href="/karte" className="rounded-full border border-emerald-900 px-6 py-3 font-bold">{t('success.map')}</Link>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="card mx-auto max-w-3xl p-6 md:p-10">
        <ReportProgress current={step} total={totalSteps} label={t('progress', {current: step, total: totalSteps})} />
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
          {step < totalSteps ? (
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
