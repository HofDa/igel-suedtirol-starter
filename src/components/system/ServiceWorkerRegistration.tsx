'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/site-path';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      navigator.serviceWorker
        .register(withBasePath('/sw.js'), { scope: `${basePath}/` })
        .catch(() => {
          // The application remains usable without the service worker.
        });
    }
  }, []);

  return null;
}
