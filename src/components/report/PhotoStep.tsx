'use client';

import {Camera, ImagePlus} from 'lucide-react';
import {useTranslations} from 'next-intl';

type Props = {file?: File; onFile: (file?: File) => void};

export function PhotoStep({file, onFile}: Props) {
  const t = useTranslations('report');

  return (
    <div>
      <h2 className="text-2xl font-black text-emerald-950">{t('steps.photo.title')}</h2>
      <p className="mt-2 text-emerald-950/70">{t('steps.photo.text')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-900/25 bg-white font-bold hover:border-amber-600">
          <Camera aria-hidden="true" />
          {t('steps.photo.camera')}
          <input type="file" accept="image/jpeg,image/png,image/heic,image/webp" capture="environment" className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-900/25 bg-white font-bold hover:border-amber-600">
          <ImagePlus aria-hidden="true" />
          {t('steps.photo.choose')}
          <input type="file" accept="image/jpeg,image/png,image/heic,image/webp" className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
        </label>
      </div>
      {file && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
          <span className="truncate pr-4 font-semibold">{file.name}</span>
          <button type="button" onClick={() => onFile(undefined)} className="rounded-full px-3 py-2 font-bold hover:bg-white">{t('steps.photo.remove')}</button>
        </div>
      )}
      <p className="mt-5 text-sm font-semibold text-emerald-950/65">{t('steps.photo.welfare')}</p>
    </div>
  );
}
