'use client';

import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'pet-price-view-mode';
const DEFAULT_VIEW: ViewMode = 'list';

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW);

  // Leer preferencia guardada al montar (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (stored === 'grid' || stored === 'list') {
        setViewModeState(stored);
      }
    } catch {
      // localStorage no disponible (SSR, incógnito bloqueado, etc.)
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Silenciar errores de escritura
    }
  };

  return { viewMode, setViewMode };
}
