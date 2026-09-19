'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface PWAUpdatePromptProps {
  /** For testing purposes only: forces the prompt to be visible */
  testForceShow?: boolean;
  /** Optional callback triggered on update action */
  onUpdate?: () => void;
}

export function PWAUpdatePrompt({ testForceShow = false, onUpdate }: PWAUpdatePromptProps) {
  const [showPrompt, setShowPrompt] = useState(testForceShow);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const handleUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    }
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [waitingWorker, onUpdate]);

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  useEffect(() => {
    if (testForceShow) {
      return;
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }


    let isMounted = true;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || !isMounted) return;

      // 1. Check if there's already a waiting worker
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowPrompt(true);
      }

      // 2. Track when a new service worker is installing
      const handleUpdateFound = () => {
        const installingWorker = reg.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version installed while an active controller exists
            if (isMounted) {
              setWaitingWorker(installingWorker);
              setShowPrompt(true);
            }
          }
        });
      };

      reg.addEventListener('updatefound', handleUpdateFound);

      // 3. Periodic check for updates (every 60 minutes)
      const intervalId = setInterval(() => {
        reg.update().catch(() => {});
      }, 60 * 60 * 1000);

      // 4. Check for updates on window focus / visibility change
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);

      return () => {
        reg.removeEventListener('updatefound', handleUpdateFound);
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleVisibilityChange);
      };
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [testForceShow]);

  if (!showPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Notificación de actualización de la aplicación"
      role="alert"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-surface/95 dark:bg-stone-900/95 backdrop-blur-md border border-amber-800/20 dark:border-amber-700/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl select-none" aria-hidden="true">
            ✨
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Nueva versión disponible
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
              Actualiza para ver las últimas mejoras del catálogo y precios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar notificación"
            className="text-on-surface-variant/70 hover:text-foreground p-1 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
