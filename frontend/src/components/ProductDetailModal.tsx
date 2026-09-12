'use client';

import { useEffect } from 'react';
import { Product, ExchangeRate } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, TrendingUp, Calendar, Tag, Layers, CheckCircle2 } from 'lucide-react';

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

  // Formatear fecha de la tasa oficial DD/MM/YYYY
  const formattedRateDate = rateData?.rate_date
    ? rateData.rate_date.split('-').reverse().join('/')
    : 'No disponible';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant border border-border">
                <Tag className="w-3.5 h-3.5 text-secondary" />
                {product.category}
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
          <div className="px-6 py-4 space-y-6">
            {/* Título y marca */}
            <div>
              {product.brand && (
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-display block mb-1">
                  {product.brand}
                </span>
              )}
              <h2
                id="product-detail-title"
                className="text-2xl font-bold text-primary font-display tracking-tight leading-snug"
              >
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <Layers className="w-4 h-4 text-outline" />
                <span>Presentación: <strong className="text-primary font-medium">{product.weight_kg ? `${product.weight_kg} kg` : product.unit}</strong></span>
              </div>
            </div>

            {/* Tarjeta de Precios */}
            <div className="bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high rounded-2xl p-5 border border-border space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Precios y Conversión Oficial
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-border">
                {/* Precio USD */}
                <div className="pr-2">
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">
                    Precio en Dólares
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-primary font-display">
                    ${Number(product.price_usd).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-muted-foreground">Moneda base (USD)</span>
                </div>

                {/* Precio Bs */}
                <div className="pl-4">
                  <span className="text-xs font-semibold text-muted-foreground block mb-1">
                    Precio en Bolívares
                  </span>
                  {priceBs !== null ? (
                    <div className="text-2xl sm:text-3xl font-extrabold text-secondary font-display">
                      Bs.&nbsp;{Number(priceBs).toFixed(2)}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-error block">No disponible</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">Al cambio oficial</span>
                </div>
              </div>

              {/* Información de la Tasa BCV y Fecha */}
              <div className="pt-3 border-t border-border flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="w-4 h-4 text-secondary shrink-0" />
                    Tasa Oficial BCV:
                  </span>
                  <span className="font-bold text-primary text-sm">
                    {currentRate ? `Bs. ${Number(currentRate).toFixed(2)}` : 'N/D'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-secondary shrink-0" />
                    Fecha del valor oficial:
                  </span>
                  <span className="font-semibold text-primary">
                    {formattedRateDate}
                  </span>
                </div>

                {rateData?.source && (
                  <div className="text-[11px] text-outline text-right mt-0.5">
                    Fuente: Banco Central de Venezuela ({rateData.source})
                  </div>
                )}
              </div>
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
