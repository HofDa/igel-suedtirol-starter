'use client';

import {WifiOff} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect, useState} from 'react';

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
    <div className="bg-ink px-4 py-2 text-center text-sm font-bold text-white" role="status">
      <span className="inline-flex items-center gap-2">
        <WifiOff size={17} aria-hidden="true" />
        {t('offline')}
      </span>
    </div>
  );
}
