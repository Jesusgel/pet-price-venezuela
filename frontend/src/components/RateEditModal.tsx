'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rate: number) => void;
  currentRate?: number;
  isLoading: boolean;
}

export function RateEditModal({
  isOpen,
  onClose,
  onSubmit,
  currentRate = 0,
  isLoading,
}: RateEditModalProps) {
  const [rateValue, setRateValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRateValue(currentRate ? String(currentRate) : '');
      setError(null);
    }
  }, [isOpen, currentRate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateValue);

    if (isNaN(val) || val <= 0) {
      setError('Introduce un valor de tasa válido mayor a 0 (ej: 38.50).');
      return;
    }

    setError(null);
    onSubmit(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
        >
          <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface-container-low">
            <h2 className="text-xl font-bold text-primary font-display">Editar Tasa BCV Actual</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white" noValidate>
            <div>
              <label htmlFor="modal-rate-val" className="block text-sm font-semibold text-on-surface-variant mb-1">
                Tasa de Cambio (Bs / USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary">
                  Bs.
                </span>
                <input
                  id="modal-rate-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={rateValue}
                  onChange={(e) => {
                    setRateValue(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg border text-foreground font-bold text-lg focus:outline-none focus:ring-2 transition-all ${
                    error
                      ? 'border-error bg-error/5 focus:ring-error/25 focus:border-error'
                      : 'border-border bg-surface-container-low focus:ring-secondary/25 focus:border-secondary'
                  }`}
                  placeholder="38.50"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-error text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground bg-surface-container p-3 rounded-lg border border-border">
              Al guardar, los precios en Bolívares de todos los productos se actualizarán automáticamente.
            </p>

            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? 'Guardando...' : 'Guardar Tasa'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
