'use client';

import { LayoutGrid, List } from 'lucide-react';
import { ViewMode } from '@/hooks/useViewMode';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg bg-surface-container border border-border shadow-sm"
      role="group"
      aria-label="Cambiar vista"
    >
      <button
        id="view-toggle-grid"
        onClick={() => onChange('grid')}
        title="Vista cuadrícula"
        aria-pressed={viewMode === 'grid'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-white text-primary shadow-sm border border-border'
            : 'text-muted-foreground hover:text-primary hover:bg-surface-container-high'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        id="view-toggle-list"
        onClick={() => onChange('list')}
        title="Vista lista"
        aria-pressed={viewMode === 'list'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-white text-primary shadow-sm border border-border'
            : 'text-muted-foreground hover:text-primary hover:bg-surface-container-high'
        }`}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Lista</span>
      </button>
    </div>
  );
}
