'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

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
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="bg-white dark:bg-stone-900 border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 id="pwa-update-title" className="text-xl sm:text-2xl font-bold text-primary font-display">
            Actualización Requerida
          </h3>
          <p id="pwa-update-desc" className="text-sm text-muted-foreground leading-relaxed">
            Hemos desplegado una nueva versión con mejoras críticas en el catálogo, cálculo de precios y seguridad. Por favor actualiza para continuar operando.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleUpdate}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-all shadow-md active:scale-95 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAUpdatePrompt;
