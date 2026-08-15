'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Package, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  rate: number | undefined;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export function ProductCard({ product, rate, onEdit, onDelete }: ProductCardProps) {
  const { addToCart } = useCart();
  // Usa price_bs de la API si está disponible; si no, calcula con el rate BCV
  const priceBs = product.price_bs || (rate ? product.price_usd * rate : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Añadido a presupuesto: ${product.name}`, { id: `cart-${product.id}` });
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover border border-border hover:border-primary-fixed-dim transition-all duration-300 flex flex-col h-full"
    >
      {/* Badges + acciones */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-surface-container text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide border border-border">
          {product.category}
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

      {/* Imagen / placeholder */}
      <div className="w-full aspect-square bg-surface-container-low rounded-xl mb-4 flex items-center justify-center border border-border overflow-hidden">
        <Package className="w-16 h-16 text-surface-dim group-hover:scale-110 transition-transform duration-500" />
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
        <div className="mt-auto pt-4 border-t border-border flex items-end justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Precio USD</span>
            <span className="text-lg font-black text-primary">
              ${Number(product.price_usd).toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-medium text-muted-foreground">Precio BCV</span>
            {priceBs !== null ? (
              <span className="text-lg font-bold text-secondary">
                Bs.&nbsp;{Number(priceBs).toFixed(2)}
              </span>
            ) : (
              <span className="text-sm font-medium text-outline italic">
                No disponible
              </span>
            )}
          </div>
        </div>

        {/* Botón Agregar al Presupuesto */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-secondary hover:text-white text-primary text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 border border-border hover:border-secondary shadow-sm active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar a Presupuesto
        </button>
      </div>
    </motion.div>
  );
}
