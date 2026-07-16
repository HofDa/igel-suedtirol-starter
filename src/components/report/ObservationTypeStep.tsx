'use client';

import {ArrowRight, Bandage, CircleHelp, HeartPulse, PawPrint, Skull, type LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useFormContext} from 'react-hook-form';
import {Link} from '@/i18n/navigation';
import type {ReportFormValues} from '@/lib/report/schema';
import {observationTypes} from '@/lib/report/schema';

const icons: Record<(typeof observationTypes)[number], LucideIcon> = {
  alive: HeartPulse,
  injured: Bandage,
  dead: Skull,
  trace: PawPrint,
  uncertain: CircleHelp
};

export function ObservationTypeStep() {
  const t = useTranslations('report');
  const {register, watch, formState: {errors}} = useFormContext<ReportFormValues>();
  const value = watch('observationType');

  return (
    <fieldset>
      <legend className="text-2xl font-black text-emerald-950">{t('steps.type.title')}</legend>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {observationTypes.map((type) => {
          const Icon = icons[type];
          return (
            <label key={type} className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 font-bold transition ${value === type ? 'border-amber-600 bg-amber-50' : 'border-emerald-950/10 bg-white hover:border-emerald-800/30'}`}>
              <input type="radio" value={type} {...register('observationType')} className="sr-only" />
              <Icon size={30} className={value === type ? 'text-amber-700' : 'text-emerald-900/60'} aria-hidden="true" />
              {t(`observationTypes.${type}`)}
            </label>
          );
        })}
      </div>
      {errors.observationType && (
        <p className="mt-3 text-sm font-bold text-red-700" role="alert">{t('validation.observationType')}</p>
      )}
      {value === 'injured' && (
        <div className="mt-5 rounded-xl border border-red-700/20 bg-red-50 p-4 text-red-900" role="alert">
          <p className="font-semibold">{t('steps.type.injuredNotice')}</p>
          <Link href="/hilfe" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-5 font-bold text-white hover:bg-red-800">
            {t('steps.type.injuredLink')} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </fieldset>
  );
}
