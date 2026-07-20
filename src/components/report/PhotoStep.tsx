'use client';

import Image from 'next/image';
import {Camera, ImagePlus} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect, useMemo, useState} from 'react';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

type Props = {file?: File; onFile: (file?: File) => void};

export function PhotoStep({file, onFile}: Props) {
  const t = useTranslations('report');
  const [sizeError, setSizeError] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function select(selected?: File) {
    if (selected && selected.size > MAX_FILE_SIZE) {
      setSizeError(true);
      onFile(undefined);
      return;
    }
    setSizeError(false);
    onFile(selected);
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-ink">{t('steps.photo.title')}</h2>
      <p className="mt-2 text-ink/70">{t('steps.photo.text')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-forest-dark/25 bg-white font-bold hover:border-brand-pink">
          <Camera aria-hidden="true" />
          {t('steps.photo.camera')}
          <input type="file" accept="image/jpeg,image/png,image/heic,image/webp" capture="environment" className="sr-only" onChange={(event) => select(event.target.files?.[0])} />
        </label>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-forest-dark/25 bg-white font-bold hover:border-brand-pink">
          <ImagePlus aria-hidden="true" />
          {t('steps.photo.choose')}
          <input type="file" accept="image/jpeg,image/png,image/heic,image/webp" className="sr-only" onChange={(event) => select(event.target.files?.[0])} />
        </label>
      </div>
      <p className="mt-3 text-sm text-ink/65">{t('steps.photo.formats')}</p>
      {sizeError && (
        <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">{t('steps.photo.tooLarge')}</p>
      )}
      {file && (
        <div className="mt-5 flex items-center gap-4 rounded-xl bg-sand-light p-4">
          {previewUrl && (
            <Image src={previewUrl} alt={t('steps.photo.previewAlt')} width={80} height={80} unoptimized className="h-20 w-20 shrink-0 rounded-lg object-cover" />
          )}
          <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
          <button type="button" onClick={() => select(undefined)} className="min-h-11 rounded-full px-3 py-2 font-bold hover:bg-white">{t('steps.photo.remove')}</button>
        </div>
      )}
      <p className="mt-5 text-sm font-semibold text-ink/65">{t('steps.photo.welfare')}</p>
    </div>
  );
}
