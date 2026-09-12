'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado con alcance:', reg.scope);
        })
        .catch((err) => {
          console.error('Fallo al registrar Service Worker:', err);
        });
    }
  }, []);

  return null;
}
