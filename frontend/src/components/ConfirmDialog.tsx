'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  isLoading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Foco inicial seguro en el botón Cancelar y bloqueo de scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Posicionar foco inicial en botón Cancelar
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onCancel]);

  const variantStyles = {
    danger: {
      iconBg: 'bg-error/10 text-error border-error/20',
      defaultIcon: <AlertTriangle className="w-7 h-7" />,
      confirmBtn: 'bg-error hover:bg-error/90 text-white shadow-sm',
    },
    warning: {
      iconBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      defaultIcon: <AlertCircle className="w-7 h-7" />,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    },
    primary: {
      iconBg: 'bg-secondary/10 text-secondary border-secondary/20',
      defaultIcon: <Info className="w-7 h-7" />,
      confirmBtn: 'bg-secondary hover:bg-secondary/90 text-white shadow-sm',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          onClick={onCancel}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
          />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-border rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-6 sm:p-8 text-center space-y-6"
          >
            {/* Icono de advertencia / severidad */}
            <div
              className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border shrink-0 ${currentVariant.iconBg}`}
            >
              {icon || currentVariant.defaultIcon}
            </div>

            {/* Título y descripción */}
            <div className="space-y-2">
              <h3
                id="confirm-dialog-title"
                className="text-xl sm:text-2xl font-bold text-primary font-display tracking-tight"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-description"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {description}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-1/2 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95 disabled:opacity-50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full sm:w-1/2 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${currentVariant.confirmBtn}`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
