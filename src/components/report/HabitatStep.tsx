'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {ChoiceCard} from '@/components/ui/ChoiceCard';
import type {ReportDraftValues} from '@/lib/report/schema';
import {habitats} from '@/lib/report/schema';

const features = [
  'robotMowerNearby',
  'fenceNearby',
  'roadNearby',
  'poolOrShaftNearby',
  'gardenPassagePresent',
  'shelterPresent',
  'waterSourcePresent',
  'artificialLightingNearby',
  'dogOrCatNearby'
] as const;

export function HabitatStep() {
  const t = useTranslations('report');
  const {register, formState: {errors}} = useFormContext<ReportDraftValues>();

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.habitat.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.habitat.text')}</p>

      <fieldset className="mt-6">
        <legend className="font-semibold text-ink">{t('steps.habitat.surroundings')}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {habitats.map((habitat) => (
            <ChoiceCard
              key={habitat}
              type="radio"
              compact
              value={habitat}
              label={t(`habitats.${habitat}`)}
              {...register('habitat')}
            />
          ))}
        </div>
        {errors.habitat && <p role="alert" className="mt-3 text-caption font-medium text-danger">{t('validation.habitat')}</p>}
      </fieldset>

      <fieldset className="mt-8">
        <legend className="font-semibold text-ink">{t('steps.habitat.features')}</legend>
        <p className="mt-1 text-caption text-ink-dim">{t('steps.habitat.featuresHint')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <ChoiceCard
              key={feature}
              type="checkbox"
              compact
              label={t(`features.${feature}`)}
              {...register(`features.${feature}`)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
