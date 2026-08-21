'use client';

import { useTranslations } from 'next-intl';
import type {ReportStep} from './useReportNavigation';

type Props = {
  current: number;
  steps: readonly ReportStep[];
};

/**
 * Ein ruhiger, vertrauter Fortschrittsbalken statt eines technischen
 * Sieben-Segment-Laufwerks. Zurück geht es weiterhin über die klare
 * Zurück-Schaltfläche; die Zusammenfassung verlinkt direkt zu Angaben.
 */
export function StepTransport({current, steps}: Props) {
  const t = useTranslations('report');
  const total = steps.length;
  const step = steps[current - 1];
  const progress = (current / total) * 100;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-title font-semibold text-ink">{t(`steps.${step.key}.label`)}</span>
          {step.optional && (
            <span className="rounded-full bg-accent-wash px-3 py-1 text-caption font-medium text-ink">
              {t('optional')}
            </span>
          )}
        </p>
        <p className="text-caption text-ink-dim">{t('stepCounter', { current, total })}</p>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-well"
        role="progressbar"
        aria-label={t('progressLabel')}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <span
          className="block h-full rounded-full bg-primary ring-1 ring-inset ring-ink/20 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {t('stepJump', { position: current, total, name: t(`steps.${step.key}.label`) })}
      </p>
    </div>
  );
}
