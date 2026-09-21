'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { formatBs, formatUSD } from '@/utils/currency';
import { getCategoryVisual } from '@/utils/categoryVisuals';

interface ProductRowProps {
  product: Product;
  rate: number | undefined;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
  onSelect?: (product: Product) => void;
}

export function ProductRow({ product, rate, onEdit, onDelete, onSelect }: ProductRowProps) {
  // Prioriza el cálculo dinámico con la tasa activa en memoria para recálculo instantáneo
  const priceBs = rate ? Number((product.price_usd * rate).toFixed(2)) : (product.price_bs ?? null);
  const visual = getCategoryVisual(product.category);
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low group/row-wrapper">
      {/* Botones de acción revelados al deslizar hacia la izquierda (Mobile Swipe Actions) */}
      {hasActions && (
        <div className="absolute inset-y-0 right-0 flex items-stretch z-0">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="w-16 flex flex-col items-center justify-center bg-secondary/15 hover:bg-secondary/25 text-secondary transition-colors"
              title="Editar producto"
            >
              <Pencil className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Editar</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="w-16 flex flex-col items-center justify-center bg-error text-white hover:bg-error/90 transition-colors"
              title="Eliminar producto"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Borrar</span>
            </button>
          )}
        </div>
      )}

      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        drag={hasActions ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: -128, right: 0 }}
        dragElastic={0.05}
        onClick={() => onSelect?.(product)}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={(e) => {
          if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect(product);
          }
        }}
        className={`relative z-10 group flex items-center gap-4 px-4 py-3 bg-white border border-border hover:border-primary-fixed-dim hover:shadow-md card-shadow transition-colors duration-200 ${
          onSelect ? 'cursor-pointer' : ''
        }`}
      >
      {/* Icono de categoría ultraligero */}
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${visual.bgGradient} border ${visual.borderColor} flex items-center justify-center shrink-0 transition-colors duration-200`}
      >
        <span
          role="img"
          aria-label={visual.label}
          className="text-lg select-none group-hover:scale-110 transition-transform duration-200"
        >
          {visual.emoji}
        </span>
      </div>

      {/* Nombre + unidad (columna principal) */}
      <div className="flex-[3] min-w-0">
        <p className="text-sm font-bold text-primary truncate font-display leading-tight">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {product.weight_kg ? `${product.weight_kg} kg` : product.unit}
        </p>
      </div>

      {/* Marca */}
      <div className="flex-[1.5] min-w-0 hidden md:block">
        {product.brand ? (
          <span className="text-xs font-semibold text-secondary uppercase tracking-wide truncate block font-display">
            {product.brand}
          </span>
        ) : (
          <span className="text-xs text-outline italic">—</span>
        )}
      </div>

      {/* Categoría */}
      <div className="flex-1 hidden lg:flex items-center">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide border truncate max-w-full ${visual.badgeClass}`}
        >
          <span className="text-xs leading-none" role="img" aria-label={visual.label}>
            {visual.emoji}
          </span>
          <span className="truncate">{product.category}</span>
        </span>
      </div>

      {/* Precio USD */}
      <div className="flex-1 hidden sm:block text-right">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">USD</p>
        <p className="text-sm font-black text-primary">
          {formatUSD(product.price_usd)}
        </p>
      </div>

      {/* Precio BCV */}
      <div className="flex-1 text-right">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">BCV</p>
        {priceBs !== null ? (
          <p className="text-sm font-bold text-secondary">
            {formatBs(priceBs)}
          </p>
        ) : (
          <p className="text-xs text-outline italic">No disp.</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onEdit && (
          <button
            id={`edit-product-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            title="Editar"
            className="p-1.5 text-muted-foreground hover:text-secondary hover:bg-surface-container rounded-lg transition-all duration-150"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            id={`delete-product-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            title="Eliminar"
            className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/5 rounded-lg transition-all duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
    </div>
  );
}
