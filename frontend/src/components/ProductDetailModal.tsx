'use client';

import { useEffect } from 'react';
import { Product, ExchangeRate } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Tag, Layers, CheckCircle2, DollarSign } from 'lucide-react';
import { formatBsNumber, formatUSD } from '@/utils/currency';
import { getCategoryVisual } from '@/utils/categoryVisuals';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  rateData?: ExchangeRate | null;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  rateData,
}: ProductDetailModalProps) {
  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const currentRate = rateData?.rate;
  const priceBs = product.price_bs || (currentRate ? product.price_usd * currentRate : null);
  const visual = getCategoryVisual(product.category);

  // Formatear fecha de la tasa oficial DD/MM/YYYY
  const formattedRateDate = rateData?.rate_date
    ? rateData.rate_date.split('-').reverse().join('/')
    : 'No disponible';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop con desenfoque */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
        />

        {/* Contenedor del Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden z-10 my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          {/* Header con botón de cerrar */}
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${visual.badgeClass}`}
              >
                <span className="text-sm leading-none" role="img" aria-label={visual.label}>
                  {visual.emoji}
                </span>
                <span>{product.category}</span>
              </span>
              {product.is_active && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Activo
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo principal */}
          <div className="px-5 sm:px-6 py-4 space-y-5">
            {/* Título y marca */}
            <div>
              {product.brand && (
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-display block mb-1">
                  {product.brand}
                </span>
              )}
              <h2
                id="product-detail-title"
                className="text-xl sm:text-2xl font-bold text-primary font-display tracking-tight leading-snug"
              >
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <Layers className="w-4 h-4 text-outline shrink-0" />
                <span>Presentación: <strong className="text-primary font-medium">{product.weight_kg ? `${product.weight_kg} kg` : product.unit}</strong></span>
              </div>
            </div>

            {/* Tarjeta Destacada de Precio en Bolívares (Ancho Completo, Sin Desborde) */}
            <div className="bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high rounded-2xl p-4 sm:p-5 border border-secondary/20 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Precio en Bolívares
                </span>
                <span className="text-[11px] font-medium text-muted-foreground bg-white/90 px-2.5 py-0.5 rounded-full border border-border">
                  Tasa Oficial BCV
                </span>
              </div>

              {priceBs !== null ? (
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-xl sm:text-2xl font-bold text-secondary">
                    Bs.
                  </span>
                  <span className="text-2xl sm:text-4xl font-extrabold text-secondary font-display tracking-tight break-all">
                    {formatBsNumber(priceBs)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-semibold text-error block">No disponible</span>
              )}

              <p className="text-[11px] text-muted-foreground mt-1">
                Calculado multiplicando el precio base en USD por la tasa oficial vigente.
              </p>
            </div>

            {/* Grid Secundario: Precio USD y Tasa BCV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Precio USD */}
              <div className="bg-white rounded-xl p-3.5 border border-border shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Precio Base (USD)</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-primary font-display">
                  {formatUSD(product.price_usd)}
                </div>
              </div>

              {/* Tasa Oficial BCV */}
              <div className="bg-white rounded-xl p-3.5 border border-border shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Tasa Oficial BCV</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-primary font-display">
                  {currentRate ? `Bs. ${formatBsNumber(currentRate)}` : 'N/D'}
                </div>
              </div>
            </div>

            {/* Fila Informativa: Fecha de la Tasa Oficial */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border text-xs gap-2">
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <Calendar className="w-4 h-4 text-secondary shrink-0" />
                <span className="truncate">Fecha de la tasa oficial:</span>
              </div>
              <span className="font-bold text-primary bg-white px-2.5 py-1 rounded-md border border-border shadow-2xs shrink-0">
                {formattedRateDate}
              </span>
            </div>
          </div>

          {/* Footer con botón de acción */}
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-border flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-all shadow-md active:scale-98"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
