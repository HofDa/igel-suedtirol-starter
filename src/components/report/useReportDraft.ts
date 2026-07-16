import {useCallback, useEffect, useRef, useState} from 'react';
import type {UseFormReturn} from 'react-hook-form';
import type {Locale} from '@/i18n/routing';
import {clearDraft, loadDraft, saveDraft} from '@/lib/offline/drafts';
import type {ReportDraftValues, ReportSubmission} from '@/lib/report/schema';

type ReportMethods = UseFormReturn<ReportDraftValues, unknown, ReportSubmission>;

type Options = {
  methods: ReportMethods;
  defaults: ReportDraftValues;
  locale: Locale;
  step: number;
  restoreStep: (step: number) => void;
  resetStep: () => void;
};

const SAVE_DELAY_MS = 400;

export function useReportDraft({methods, defaults, locale, step, restoreStep, resetStep}: Options) {
  const [hydrated, setHydrated] = useState(false);
  const [restoredAt, setRestoredAt] = useState<string>();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suspended = useRef(false);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    loadDraft()
      .then((draft) => {
        if (!draft) return;
        methods.reset({...draft.values, submittedLocale: locale});
        restoreStep(draft.step);
        setRestoredAt(draft.updatedAt);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [locale, methods, restoreStep]);

  const scheduleSave = useCallback(
    (values: ReportDraftValues) => {
      if (suspended.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft({values, step: stepRef.current, updatedAt: new Date().toISOString()}).catch(() => undefined);
      }, SAVE_DELAY_MS);
    },
    []
  );

  useEffect(() => {
    if (!hydrated) return;
    const unsubscribe = methods.subscribe({
      formState: {values: true, isDirty: true},
      callback: (state) => {
        // Nur echte Eingaben sichern: reset()-Emissionen und unberührte
        // Formulare erzeugen sonst bei jedem Besuch einen Phantom-Entwurf.
        const dirty = state.isDirty ?? methods.formState.isDirty;
        if (!dirty) return;
        scheduleSave(mergeDraft(defaults, state.values));
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(saveTimer.current);
    };
  }, [defaults, hydrated, methods, scheduleSave]);

  useEffect(() => {
    // Schrittwechsel über Schritt 1 hinaus bedeuten eine aktive Nutzung
    // und werden mitgesichert; der Erststand allein wird nie gespeichert.
    if (!hydrated || step === 1) return;
    scheduleSave(mergeDraft(defaults, methods.getValues()));
  }, [defaults, hydrated, methods, scheduleSave, step]);

  async function finalize() {
    suspended.current = true;
    clearTimeout(saveTimer.current);
    await clearDraft().catch(() => undefined);
  }

  async function discard() {
    suspended.current = true;
    clearTimeout(saveTimer.current);
    methods.reset(defaults);
    resetStep();
    setRestoredAt(undefined);
    await clearDraft().catch(() => undefined);
    suspended.current = false;
  }

  return {restoredAt, discard, finalize};
}

function mergeDraft(defaults: ReportDraftValues, values: ReportDraftValues): ReportDraftValues {
  return {
    ...defaults,
    ...values,
    features: {...defaults.features, ...values.features}
  };
}
