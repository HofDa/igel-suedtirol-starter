'use client';

import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import type {ReportDraftValues} from '@/lib/report/schema';
import {habitats} from '@/lib/report/schema';

const features = ['robotMowerNearby', 'fenceNearby', 'roadNearby', 'poolOrShaftNearby', 'gardenPassagePresent', 'shelterPresent', 'waterSourcePresent'] as const;

export function HabitatStep() {
  const t = useTranslations('report');
  const {register} = useFormContext<ReportDraftValues>();

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.habitat.title')}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {habitats.map((habitat) => (
          <label key={habitat} className="flex min-h-12 items-center gap-3 rounded-xl border border-emerald-950/10 bg-white px-4">
            <input type="radio" value={habitat} {...register('habitat')} className="h-5 w-5" />
            {t(`habitats.${habitat}`)}
          </label>
        ))}
      </div>
      <fieldset className="mt-7">
        <legend className="font-bold">{t('steps.habitat.features')}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <label key={feature} className="flex min-h-12 items-center gap-3 rounded-xl bg-emerald-50 px-4">
              <input type="checkbox" {...register(`features.${feature}`)} className="h-5 w-5" />
              {t(`features.${feature}`)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
