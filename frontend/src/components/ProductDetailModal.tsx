'use client';

import { useEffect } from 'react';
import { Product, ExchangeRate } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Layers, CheckCircle2, DollarSign, Banknote, ShoppingBasket } from 'lucide-react';
import { formatBsNumber, formatUSD } from '@/utils/currency';
import { getCategoryVisual } from '@/utils/categoryVisuals';
import { WeightPriceCalculator } from './WeightPriceCalculator';

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
  const priceBsRetail = product.price_bs_retail || (currentRate && product.price_usd_retail ? product.price_usd_retail * currentRate : null);
  const visual = getCategoryVisual(product.category);

  const formattedRateDate = rateData?.rate_date
    ? rateData.rate_date.split('-').reverse().join('/')
    : 'No disponible';

  // Determinar si mostrar la calculadora (necesita al menos un precio configurado)
  const hasAnyPrice =
    product.price_usd > 0 ||
    product.price_usd_retail !== null ||
    product.price_usd_cash !== null ||
    product.price_usd_retail_cash !== null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
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
          {/* Header */}
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
          <div className="px-5 sm:px-6 py-4 space-y-4">
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
                <span>
                  Presentación:{' '}
                  <strong className="text-primary font-medium">
                    {product.weight_kg ? `${product.weight_kg} kg` : product.unit}
                  </strong>
                </span>
              </div>
            </div>

            {/* ── Bloque 1: Precio Saco al BCV ── */}
            <div className="bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high rounded-2xl p-4 sm:p-5 border border-secondary/20 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Precio Saco · BCV
                </span>
                <span className="text-[11px] font-medium text-muted-foreground bg-white/90 px-2.5 py-0.5 rounded-full border border-border">
                  Tasa Oficial BCV
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                {/* En Bs. */}
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Bolívares</p>
                  {priceBs !== null ? (
                    <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                      <span className="text-lg font-bold text-secondary">Bs.</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-secondary font-display tracking-tight break-all">
                        {formatBsNumber(priceBs)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-error">No disponible</span>
                  )}
                </div>
                {/* En USD */}
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Dólar</p>
                  <span className="text-xl font-black text-primary font-display">
                    {formatUSD(product.price_usd)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Bloque 2: Precio Detal al BCV (si existe) ── */}
            {product.price_usd_retail !== null && (
              <div className="bg-white rounded-2xl p-4 border border-border shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <ShoppingBasket className="w-3.5 h-3.5" />
                    Precio Detal · BCV
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground bg-surface-container px-2.5 py-0.5 rounded-full border border-border">
                    Tasa Oficial BCV
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Bolívares</p>
                    {priceBsRetail !== null ? (
                      <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                        <span className="text-base font-bold text-primary">Bs.</span>
                        <span className="text-xl font-extrabold text-primary font-display tracking-tight break-all">
                          {formatBsNumber(priceBsRetail)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-error">No disponible</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Dólar</p>
                    <span className="text-lg font-black text-primary font-display">
                      {formatUSD(product.price_usd_retail)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Bloque 3: Precio Saco Efectivo (si existe) ── */}
            {product.price_usd_cash !== null && (
              <div className="bg-white rounded-2xl p-4 border border-border shadow-xs">
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Precio Saco · Efectivo USD
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-700 font-display">
                  {formatUSD(product.price_usd_cash)}
                </span>
              </div>
            )}

            {/* ── Bloque 4: Precio Detal Efectivo (si existe) ── */}
            {product.price_usd_retail_cash !== null && (
              <div className="bg-white rounded-2xl p-4 border border-border shadow-xs">
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Precio Detal · Efectivo USD
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-700 font-display">
                  {formatUSD(product.price_usd_retail_cash)}
                </span>
              </div>
            )}

            {/* ── Calculadora multi-modo ── */}
            {hasAnyPrice && (
              <WeightPriceCalculator
                priceUsd={product.price_usd}
                priceUsdRetail={product.price_usd_retail}
                priceUsdCash={product.price_usd_cash}
                priceUsdRetailCash={product.price_usd_retail_cash}
                weightKg={product.weight_kg}
                rate={currentRate ?? null}
                productName={product.name}
              />
            )}

            {/* ── Fila informativa: tasa y fecha ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3.5 border border-border shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span>Tasa Oficial BCV</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-primary font-display">
                  {currentRate ? `Bs. ${formatBsNumber(currentRate)}` : 'N/D'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-border text-xs gap-2">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                  <Calendar className="w-4 h-4 text-secondary shrink-0" />
                  <span className="truncate">Fecha tasa:</span>
                </div>
                <span className="font-bold text-primary bg-white px-2.5 py-1 rounded-md border border-border shadow-2xs shrink-0">
                  {formattedRateDate}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
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
