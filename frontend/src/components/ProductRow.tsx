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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={() => onSelect?.(product)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className={`group flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border hover:border-primary-fixed-dim hover:shadow-md card-shadow transition-all duration-200 ${
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
  );
}
