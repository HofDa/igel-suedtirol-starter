'use client';

import {WifiOff} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect, useState} from 'react';

/**
 * Verbindungsverlust wird ruhig und nicht-modal gemeldet (AGENTS.md, Regel 8):
 * ein Streifen am oberen Rand, der nichts blockiert und nichts überdeckt.
 */
export function OfflineStatus() {
  const t = useTranslations('system');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;

  return (
    <div role="status" className="border-b border-line bg-well px-4 py-2 text-center">
      <span className="inline-flex items-center gap-2 text-caption font-medium text-ink">
        <WifiOff size={15} aria-hidden="true" className="text-ink-faint" />
        {t('offline')}
      </span>
    </div>
  );
}
