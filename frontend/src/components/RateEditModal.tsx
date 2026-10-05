'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { RatePreviewResponse } from '@/types';
import { formatBsNumber, formatUSD } from '@/utils/currency';

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
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [rateValue, setRateValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<RatePreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRateValue(currentRate ? String(currentRate) : '');
      setError(null);
      setStep('input');
      setPreviewData(null);
      setConfirmedCheckbox(false);
      setIsPreviewLoading(false);
    }
  }, [isOpen, currentRate]);

  if (!isOpen) return null;

  // Capa 1: Sanity Check y solicitud de Preview
  const handleProceedToPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateValue);

    if (isNaN(val)) {
      setError('Introduce un valor numérico válido.');
      return;
    }

    if (val < 1.0 || val > 10000.0) {
      setError('La tasa debe estar dentro de un rango razonable entre Bs. 1,00 y Bs. 10.000,00.');
      return;
    }

    setError(null);
    setIsPreviewLoading(true);

    try {
      const preview = await api.previewRateChange(val);
      setPreviewData(preview);
      setStep('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo obtener la simulación de impacto.';
      setError(msg);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Capa 3: Confirmación final consciente
  const handleFinalSubmit = () => {
    const val = parseFloat(rateValue);
    if (previewData?.is_high_deviation && !confirmedCheckbox) {
      return;
    }
    onSubmit(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-surface-container-low">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary font-display">
                {step === 'input' ? 'Modificar Tasa de Cambio' : 'Salvaguarda de Tasa (Doble Confirmación)'}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || isPreviewLoading}
              className="p-2 rounded-full hover:bg-surface-container text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Paso 1: Ingreso de tasa + Sanity Check */}
          {step === 'input' && (
            <form onSubmit={handleProceedToPreview} className="p-6 space-y-5 bg-white" noValidate>
              <div>
                <label htmlFor="modal-rate-val" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nueva Tasa de Cambio (Bs / USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary">
                    Bs.
                  </span>
                  <input
                    id="modal-rate-val"
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="10000.00"
                    value={rateValue}
                    onChange={(e) => {
                      setRateValue(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-foreground font-black text-xl focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? 'border-error bg-error/5 focus:ring-error/25 focus:border-error'
                        : 'border-border bg-surface-container-low focus:ring-secondary/25 focus:border-secondary'
                    }`}
                    placeholder="65.50"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-error text-xs font-semibold mt-2 flex items-center gap-1.5">
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              {currentRate > 0 && (
                <div className="p-3.5 rounded-xl bg-surface-container text-xs text-muted-foreground border border-border flex items-center justify-between">
                  <span>Tasa actual en sistema:</span>
                  <span className="font-bold text-primary">Bs. {Number(currentRate).toFixed(2)}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                Por seguridad, toda modificación manual debe pasar por una simulación de impacto antes de ser aplicada a los precios de la tienda.
              </p>

              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPreviewLoading}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPreviewLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Evaluando...</span>
                    </>
                  ) : (
                    <>
                      <span>Revisar Impacto</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Paso 2: Evaluación de Desviación + Simulación de Impacto */}
          {step === 'preview' && previewData && (
            <div className="p-6 space-y-5 bg-white">
              {/* Resumen de Variación */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Tasa Actual
                  </span>
                  <span className="text-lg font-black text-primary">
                    Bs. {previewData.current_rate.toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Nueva Tasa
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-secondary">
                      Bs. {previewData.proposed_rate.toFixed(2)}
                    </span>
                    <span
                      className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                        previewData.is_high_deviation
                          ? 'bg-error/15 text-error'
                          : previewData.deviation_pct > 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {previewData.proposed_rate >= previewData.current_rate ? '+' : '-'}
                      {previewData.deviation_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerta si es alta desviación */}
              {previewData.is_high_deviation ? (
                <div className="p-4 rounded-2xl bg-error/10 border border-error/25 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-error">
                      ¡Variación crítica detectada ({previewData.deviation_pct}%)!
                    </p>
                    <p className="text-on-surface-variant">
                      Esta modificación provocará un salto significativo en los precios de todos los productos en Bolívares.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center gap-2 text-xs font-medium text-primary">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span>Variación dentro de los parámetros habituales de mercado.</span>
                </div>
              )}

              {/* Simulación en productos reales */}
              {previewData.sample_impacts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Ejemplo de Impacto en Inventario Real:
                  </span>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden text-xs">
                    {previewData.sample_impacts.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-primary truncate">{item.product_name}</p>
                          <p className="text-[10px] text-muted-foreground">{formatUSD(item.price_usd)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-muted-foreground line-through">Bs. {formatBsNumber(item.old_price_bs)}</span>
                            <span className="text-primary font-black">Bs. {formatBsNumber(item.new_price_bs)}</span>
                          </div>
                          <span className={`text-[10px] font-semibold ${item.diff_bs >= 0 ? 'text-secondary' : 'text-error'}`}>
                            {item.diff_bs >= 0 ? '+' : ''}Bs. {formatBsNumber(item.diff_bs)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkbox obligatorio si desviación > 10% */}
              {previewData.is_high_deviation && (
                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-high border border-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedCheckbox}
                    onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-secondary rounded focus:ring-secondary accent-secondary"
                  />
                  <span className="text-xs font-semibold text-primary leading-tight">
                    Comprendo que este cambio modificará inmediatamente los precios en Bolívares de todo el catálogo.
                  </span>
                </label>
              )}

              {/* Botones de acción */}
              <div className="pt-3 flex justify-between items-center gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ajustar Tasa</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isLoading || (previewData.is_high_deviation && !confirmedCheckbox)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-secondary hover:bg-secondary/90 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                  >
                    {isLoading ? 'Aplicando...' : 'Aplicar Nueva Tasa'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
