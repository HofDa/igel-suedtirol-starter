'use client';

import {useEffect} from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // The application remains usable without the service worker.
      });
    }
  }, []);

  return null;
}
