import {useEffect, useRef, useState} from 'react';
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
  const savingSuspended = useRef(false);

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

  useEffect(() => {
    if (!hydrated) return;

    function scheduleSave(values: ReportDraftValues) {
      if (savingSuspended.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft({values, step, updatedAt: new Date().toISOString()}).catch(() => undefined);
      }, SAVE_DELAY_MS);
    }

    scheduleSave(mergeDraft(defaults, methods.getValues()));
    const unsubscribe = methods.subscribe({
      formState: {values: true},
      callback: ({values}) => scheduleSave(mergeDraft(defaults, values))
    });

    return () => {
      unsubscribe();
      clearTimeout(saveTimer.current);
    };
  }, [defaults, hydrated, methods, step]);

  async function discard() {
    savingSuspended.current = true;
    clearTimeout(saveTimer.current);
    methods.reset(defaults);
    resetStep();
    setRestoredAt(undefined);
    await clearDraft().catch(() => undefined);
    savingSuspended.current = false;
  }

  return {restoredAt, discard};
}

function mergeDraft(defaults: ReportDraftValues, values: ReportDraftValues): ReportDraftValues {
  return {
    ...defaults,
    ...values,
    features: {...defaults.features, ...values.features}
  };
}
