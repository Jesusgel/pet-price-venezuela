'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { formatBs, formatUSD } from '@/utils/currency';
import { getCategoryVisual } from '@/utils/categoryVisuals';

interface ProductCardProps {
  product: Product;
  rate: number | undefined;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, rate, onEdit, onDelete, onSelect }: ProductCardProps) {
  // Prioriza el cálculo dinámico con la tasa activa en memoria para recálculo instantáneo
  const priceBs = rate ? Number((product.price_usd * rate).toFixed(2)) : (product.price_bs ?? null);
  const visual = getCategoryVisual(product.category);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => onSelect?.(product)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className={`group relative bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover border border-border hover:border-primary-fixed-dim transition-all duration-300 flex flex-col h-full ${
        onSelect ? 'cursor-pointer' : ''
      }`}
    >
      {/* Badges + acciones */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div
          className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide border flex items-center gap-1.5 shadow-xs transition-colors ${visual.badgeClass}`}
        >
          <span className="text-xs leading-none" role="img" aria-label={visual.label}>
            {visual.emoji}
          </span>
          <span>{product.category}</span>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-1.5 bg-white/90 backdrop-blur text-muted-foreground hover:text-secondary rounded-full shadow-sm hover:shadow transition-all"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
              className="p-1.5 bg-white/90 backdrop-blur text-muted-foreground hover:text-error rounded-full shadow-sm hover:shadow transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Imagen / emoji de categoría ultraligero */}
      <div
        className={`w-full aspect-square bg-gradient-to-br ${visual.bgGradient} rounded-xl mb-4 flex items-center justify-center border ${visual.borderColor} overflow-hidden transition-colors duration-300`}
      >
        <span
          role="img"
          aria-label={visual.label}
          className="text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
        >
          {visual.emoji}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        {product.brand && (
          <span className="text-xs font-bold text-secondary mb-1 uppercase tracking-wider font-display">
            {product.brand}
          </span>
        )}
        <h3 className="text-base font-bold text-primary leading-tight mb-1 line-clamp-2 font-display">
          {product.name}
        </h3>

        <div className="text-sm text-muted-foreground mb-4">
          {product.weight_kg ? `${product.weight_kg} kg` : product.unit}
        </div>

        {/* Precios */}
        <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Precio USD</span>
            <span className="text-lg font-black text-primary">
              {formatUSD(product.price_usd)}
            </span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-medium text-muted-foreground">Precio BCV</span>
            {priceBs !== null ? (
              <span className="text-lg font-bold text-secondary">
                {formatBs(priceBs)}
              </span>
            ) : (
              <span className="text-sm font-medium text-outline italic">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
