'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Package, Pencil, Trash2 } from 'lucide-react';

interface ProductRowProps {
  product: Product;
  rate: number | undefined;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export function ProductRow({ product, rate, onEdit, onDelete }: ProductRowProps) {
  const priceBs = product.price_bs || (rate ? product.price_usd * rate : null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="group flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border hover:border-primary-fixed-dim hover:shadow-md card-shadow transition-all duration-200"
    >
      {/* Icono de producto */}
      <div className="w-9 h-9 rounded-lg bg-surface-container-low border border-border flex items-center justify-center shrink-0">
        <Package className="w-5 h-5 text-surface-dim group-hover:text-secondary transition-colors duration-300" />
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
        <span className="inline-block bg-surface-container text-on-surface-variant text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-border truncate max-w-full">
          {product.category}
        </span>
      </div>

      {/* Precio USD */}
      <div className="flex-1 hidden sm:block text-right">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">USD</p>
        <p className="text-sm font-black text-primary">
          ${Number(product.price_usd).toFixed(2)}
        </p>
      </div>

      {/* Precio BCV */}
      <div className="flex-1 text-right">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">BCV</p>
        {priceBs !== null ? (
          <p className="text-sm font-bold text-secondary">
            Bs.&nbsp;{Number(priceBs).toFixed(2)}
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
            onClick={() => onEdit(product)}
            title="Editar"
            className="p-1.5 text-muted-foreground hover:text-secondary hover:bg-surface-container rounded-lg transition-all duration-150"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            id={`delete-product-${product.id}`}
            onClick={() => onDelete(product.id)}
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
