'use client';

import {Pencil} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {municipalityName, type MunicipalityId} from '@/lib/locations/south-tyrol-municipalities';
import type {ReportDraftValues} from '@/lib/report/schema';
import type {ReportStep, ReportStepKey} from './useReportNavigation';

type Props = {files: File[]; steps: readonly ReportStep[]; onGoTo: (step: number) => void};

export function ReportSummary({files, steps, onGoTo}: Props) {
  const t = useTranslations('report');
  const locale = useLocale() as 'de' | 'it';
  const {watch} = useFormContext<ReportDraftValues>();
  const values = watch();
  const stepFor = (key: ReportStepKey) => steps.findIndex((step) => step.key === key) + 1;
  const rows: Array<{key: ReportStepKey; label: string; value: string}> = [];

  if (stepFor('type')) rows.push({key: 'type', label: t('summary.type'), value: values.observationType ? t(`observationTypes.${values.observationType}`) : t('summary.missing')});
  rows.push({key: 'time', label: t('summary.time'), value: values.observedDate ? `${new Date(`${values.observedDate}T00:00:00`).toLocaleDateString(locale)} · ${values.timeAccuracy === 'date_only' ? t('steps.time.accuracies.date_only') : values.timeAccuracy === 'range' ? `${values.observedTimeFrom}–${values.observedTimeTo}` : values.observedTimeFrom}` : t('summary.missing')});
  rows.push({key: 'contact', label: t('summary.contact'), value: [values.reporterFirstName, values.reporterLastName].filter(Boolean).join(' ') || t('summary.missing')});
  rows.push({key: 'location', label: t('summary.location'), value: values.municipality ? municipalityName(values.municipality as MunicipalityId, locale) : t('summary.missing')});
  rows.push({key: 'animal', label: t('summary.animal'), value: t('summary.countValue', {count: values.individualCount ?? 1})});
  if (stepFor('habitat')) rows.push({key: 'habitat', label: t('summary.habitat'), value: t(`habitats.${values.habitat ?? 'unknown'}`)});
  rows.push({key: 'media', label: t('summary.media'), value: files.length ? t('summary.mediaCount', {count: files.length}) : t('summary.noMedia')});

  return (
    <section aria-labelledby="report-summary-heading" className="rounded-panel border border-line bg-well">
      <h3 id="report-summary-heading" className="px-4 pt-4 text-caption font-semibold text-ink-dim">{t('summary.title')}</h3>
      <dl className="mt-1 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
            <dt className="w-32 shrink-0 text-caption text-ink-faint">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-caption text-ink">{row.value}</dd>
            <button type="button" onClick={() => onGoTo(stepFor(row.key))} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-caption font-medium text-ink-dim hover:bg-surface hover:text-ink">
              <Pencil size={14} aria-hidden="true" /><span className="sr-only sm:not-sr-only">{t('summary.edit')}</span><span className="sr-only">{row.label}</span>
            </button>
          </div>
        ))}
      </dl>
    </section>
  );
}
