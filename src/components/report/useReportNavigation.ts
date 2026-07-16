import {useCallback, useEffect, useRef, useState} from 'react';
import type {FieldPath, UseFormReturn} from 'react-hook-form';
import type {ReportDraftValues, ReportSubmission} from '@/lib/report/schema';

export const REPORT_STEP_COUNT = 7;

const stepFields: Record<number, FieldPath<ReportDraftValues>[]> = {
  1: ['observationType'],
  2: ['latitude', 'longitude', 'locationSource'],
  3: ['observedDate', 'observedTime', 'timeUnknown'],
  4: ['individualCount', 'behaviors'],
  5: ['habitat', 'features'],
  6: [],
  7: ['reporterName', 'reporterEmail', 'contactConsent', 'scientificUseConsent']
};

type ReportMethods = UseFormReturn<ReportDraftValues, unknown, ReportSubmission>;

export function useReportNavigation(methods: ReportMethods) {
  const [step, setStep] = useState(1);
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

  async function next() {
    const valid = await methods.trigger(stepFields[step], {shouldFocus: true});
    if (!valid) return;
    stepChangedByUser.current = true;
    setStep((value) => Math.min(value + 1, REPORT_STEP_COUNT));
  }

  function back() {
    stepChangedByUser.current = true;
    setStep((value) => Math.max(value - 1, 1));
  }

  const restoreStep = useCallback((value: number) => {
    setStep(Math.min(Math.max(value, 1), REPORT_STEP_COUNT));
  }, []);

  const resetStep = useCallback(() => {
    setStep(1);
  }, []);

  return {step, stepContainer, next, back, restoreStep, resetStep};
}
