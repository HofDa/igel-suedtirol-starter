import {useCallback, useEffect, useRef, useState} from 'react';
import type {FieldPath, UseFormReturn} from 'react-hook-form';
import type {ReportDraftValues, ReportSubmission} from '@/lib/report/schema';

/**
 * Benannte Abschnitte für den vollständigen und den verkürzten Ablauf.
 *
 * `optional` bedeutet: das Schema hat für diesen Schritt sinnvolle
 * Vorgaben, die Meldung ist auch ohne Eingabe vollständig. Das wird in
 * der Oberfläche ausgewiesen, damit niemand abbricht, weil er glaubt,
 * ein Foto sei Pflicht.
 */
export const OBSERVATION_REPORT_STEPS = [
  {key: 'type', optional: false},
  {key: 'time', optional: false},
  {key: 'contact', optional: false},
  {key: 'location', optional: false},
  {key: 'animal', optional: false},
  {key: 'behavior', optional: true},
  {key: 'habitat', optional: false},
  {key: 'media', optional: true},
  {key: 'consent', optional: false}
] as const;

export const ROADKILL_REPORT_STEPS = [
  {key: 'time', optional: false},
  {key: 'contact', optional: false},
  {key: 'location', optional: false},
  {key: 'animal', optional: false},
  {key: 'media', optional: true},
  {key: 'consent', optional: false}
] as const;

export type ReportStep = (typeof OBSERVATION_REPORT_STEPS)[number] | (typeof ROADKILL_REPORT_STEPS)[number];
export type ReportStepKey = ReportStep['key'];

const fieldsByStep: Record<ReportStepKey, FieldPath<ReportDraftValues>[]> = {
  type: ['observationType'],
  time: ['observedDate', 'observedTimeFrom', 'observedTimeTo', 'timeAccuracy'],
  contact: ['reporterFirstName', 'reporterLastName', 'reporterEmail', 'reporterPhone', 'preferredContact'],
  location: ['municipality', 'latitude', 'longitude', 'locationSource'],
  animal: ['individualCount', 'animalVitalStatus', 'ageClass', 'sex', 'roadName', 'roadPosition'],
  behavior: ['behaviors', 'behaviorOther'],
  habitat: ['habitat', 'features'],
  media: [],
  consent: ['contactConsent', 'scientificUseConsent', 'privacyNoticeConsent']
};

type ReportMethods = UseFormReturn<ReportDraftValues, unknown, ReportSubmission>;

export function useReportNavigation(methods: ReportMethods, steps: readonly ReportStep[]) {
  const [step, setStep] = useState(1);
  /** Der weiteste erreichte Schritt; nur bis dorthin darf frei gesprungen werden. */
  const [reached, setReached] = useState(1);
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

  const enter = useCallback((value: number) => {
    const target = Math.min(Math.max(value, 1), steps.length);
    stepChangedByUser.current = true;
    setStep(target);
    setReached((current) => Math.max(current, target));
  }, [steps.length]);

  async function next() {
    const valid = await methods.trigger(fieldsByStep[steps[step - 1].key], {shouldFocus: true});
    if (!valid) return;
    enter(step + 1);
  }

  function back() {
    enter(step - 1);
  }

  /** Rücksprung auf einen bereits besuchten Schritt; vorwärts nur über `next`. */
  function goTo(value: number) {
    if (value > reached) return;
    enter(value);
  }

  const restoreStep = useCallback((value: number) => {
    const target = Math.min(Math.max(value, 1), steps.length);
    setStep(target);
    setReached((current) => Math.max(current, target));
  }, [steps.length]);

  const resetStep = useCallback(() => {
    setStep(1);
    setReached(1);
  }, []);

  return {step, reached, stepContainer, next, back, goTo, restoreStep, resetStep};
}
