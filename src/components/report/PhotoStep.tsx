'use client';

import {Camera, ImagePlus, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect, useMemo, useState} from 'react';
import {Alert} from '@/components/ui/Alert';
import {buttonClass} from '@/components/ui/Button';
import {REPORT_MEDIA_CONFIG, reportMediaType} from '@/lib/report/media-config';

type Props = {files: File[]; onFiles: (files: File[]) => void};

const accept = [...REPORT_MEDIA_CONFIG.imageMimeTypes, ...REPORT_MEDIA_CONFIG.videoMimeTypes].join(',');

function Preview({file, alt}: {file: File; alt: string}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return reportMediaType(file.type) === 'video' ? (
    <video src={url} aria-label={alt} muted className="size-20 shrink-0 rounded-well object-cover" />
  ) : (
    // Blob-URLs aus der lokalen Auswahl benötigen keine Next-Optimierung.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="size-20 shrink-0 rounded-well object-cover" />
  );
}

export function PhotoStep({files, onFiles}: Props) {
  const t = useTranslations('report');
  const [error, setError] = useState<'tooMany' | 'tooLarge' | 'unsupported'>();

  function select(selected: FileList | null) {
    const additions = Array.from(selected ?? []);
    if (files.length + additions.length > REPORT_MEDIA_CONFIG.maxFiles) return setError('tooMany');
    if (additions.some((file) => !reportMediaType(file.type))) return setError('unsupported');
    if (additions.some((file) => {
      const type = reportMediaType(file.type);
      return file.size > (type === 'video' ? REPORT_MEDIA_CONFIG.maxVideoBytes : REPORT_MEDIA_CONFIG.maxImageBytes);
    })) return setError('tooLarge');
    setError(undefined);
    onFiles([...files, ...additions]);
  }

  return (
    <div>
      <h2 className="text-section font-semibold text-ink">{t('steps.media.title')}</h2>
      <p className="mt-2 max-w-prose text-ink-dim">{t('steps.media.text')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([
          {key: 'camera', icon: Camera, capture: 'environment' as const, multiple: false},
          {key: 'choose', icon: ImagePlus, capture: undefined, multiple: true}
        ] as const).map(({key, icon: Icon, capture, multiple}) => (
          <label key={key} className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-panel border border-dashed border-line-strong bg-well font-semibold text-ink transition-colors hover:border-primary hover:text-primary-deep has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-deep">
            <Icon size={26} aria-hidden="true" className="text-ink-faint" />
            {t(`steps.media.${key}`)}
            <input type="file" accept={accept} capture={capture} multiple={multiple} className="sr-only" onChange={(event) => { select(event.target.files); event.target.value = ''; }} />
          </label>
        ))}
      </div>
      <p className="mt-3 text-caption text-ink-faint">{t('steps.media.formats')}</p>
      {error && <Alert tone="danger" live="alert" className="mt-4">{t(`steps.media.${error}`)}</Alert>}

      {files.length > 0 && (
        <ol className="mt-5 grid gap-3">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-4 rounded-panel border border-line bg-well p-3">
              <Preview file={file} alt={t('steps.media.previewAlt', {position: index + 1})} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{file.name}</span>
                <span className="text-caption text-ink-faint">{t('steps.media.fileMeta', {position: index + 1, size: (file.size / 1024 / 1024).toFixed(1)})}</span>
              </span>
              <button type="button" onClick={() => onFiles(files.filter((_, fileIndex) => fileIndex !== index))} className={buttonClass('quiet', 'md', 'shrink-0')} aria-label={t('steps.media.removePosition', {position: index + 1})}>
                <X size={16} aria-hidden="true" /> <span className="hidden sm:inline">{t('steps.media.remove')}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <Alert tone="note" className="mt-6">{t('steps.media.privacy')}</Alert>
    </div>
  );
}
