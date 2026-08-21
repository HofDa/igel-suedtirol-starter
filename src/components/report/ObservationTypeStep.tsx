'use client';

import {ArrowRight, Bandage, CircleHelp, HeartPulse, PawPrint, Skull, type LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {Link} from '@/i18n/navigation';
import {Alert} from '@/components/ui/Alert';
import {buttonClass} from '@/components/ui/Button';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import type {ReportDraftValues} from '@/lib/report/schema';
import {observationTypes, requiresSosNotice} from '@/lib/report/schema';

const icons: Record<(typeof observationTypes)[number], LucideIcon> = {
  alive: HeartPulse,
  injured: Bandage,
  dead: Skull,
  trace: PawPrint,
  uncertain: CircleHelp
};

export function ObservationTypeStep() {
  const t = useTranslations('report');
  const {
    register,
    watch,
    formState: {errors}
  } = useFormContext<ReportDraftValues>();
  const value = watch('observationType');

  return (
    <fieldset>
      <legend className="text-section font-semibold text-ink">{t('steps.type.title')}</legend>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.type.text')}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {observationTypes.map((type) => (
          <ChoiceCard
            key={type}
            type="radio"
            value={type}
            icon={icons[type]}
            label={t(`observationTypes.${type}`)}
            aria-invalid={errors.observationType ? true : undefined}
            {...register('observationType')}
          />
        ))}
      </div>

      {errors.observationType && (
        <Alert tone="danger" live="alert" className="mt-4">
          {t('validation.observationType')}
        </Alert>
      )}

      {requiresSosNotice(value) && (
        <Alert
          tone="danger"
          live="alert"
          className="mt-5"
          action={
            <Link href="/hilfe" className={buttonClass('danger', 'md')}>
              {t('steps.type.injuredLink')} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        >
          <p className="font-semibold text-ink">{t('steps.type.injuredNotice')}</p>
        </Alert>
      )}
    </fieldset>
  );
}
