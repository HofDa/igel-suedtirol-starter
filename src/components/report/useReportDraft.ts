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
  files: File[];
  restoreFiles: (files: File[]) => void;
};

const SAVE_DELAY_MS = 400;

export function useReportDraft({methods, defaults, locale, step, restoreStep, resetStep, files, restoreFiles}: Options) {
  const [hydrated, setHydrated] = useState(false);
  const [restoredAt, setRestoredAt] = useState<string>();
  const [mediaDraftError, setMediaDraftError] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suspended = useRef(false);
  const stepRef = useRef(step);
  const filesRef = useRef(files);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    loadDraft()
      .then((draft) => {
        if (!draft) return;
        methods.reset({
          ...defaults,
          ...draft.values,
          features: {...defaults.features, ...draft.values.features},
          submittedLocale: locale
        });
        restoreStep(draft.step);
        restoreFiles(draft.mediaFiles ?? []);
        setRestoredAt(draft.updatedAt);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [defaults, locale, methods, restoreFiles, restoreStep]);

  const scheduleSave = useCallback(
    (values: ReportDraftValues) => {
      if (suspended.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft({values, step: stepRef.current, updatedAt: new Date().toISOString(), mediaFiles: filesRef.current})
          .then(() => setMediaDraftError(false))
          .catch(() => {
            if (filesRef.current.length > 0) setMediaDraftError(true);
          });
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

  useEffect(() => {
    if (!hydrated || files.length === 0) return;
    scheduleSave(mergeDraft(defaults, methods.getValues()));
  }, [defaults, files, hydrated, methods, scheduleSave]);

  async function finalize() {
    suspended.current = true;
    clearTimeout(saveTimer.current);
    await clearDraft().catch(() => undefined);
  }

  async function discard() {
    suspended.current = true;
    clearTimeout(saveTimer.current);
    methods.reset({...defaults, clientSubmissionId: crypto.randomUUID()});
    resetStep();
    setRestoredAt(undefined);
    setMediaDraftError(false);
    await clearDraft().catch(() => undefined);
    suspended.current = false;
  }

  return {restoredAt, mediaDraftError, discard, finalize};
}

export function mergeDraft(defaults: ReportDraftValues, values: ReportDraftValues): ReportDraftValues {
  return {
    ...defaults,
    ...values,
    features: {...defaults.features, ...values.features}
  };
}
