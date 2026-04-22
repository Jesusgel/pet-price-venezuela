'use client';

import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  rate: number | undefined;
}

export function ProductCard({ product, rate }: ProductCardProps) {
  // Use the API provided price_bs if available, otherwise calculate it if we have the rate
  const priceBs = product.price_bs || (rate ? product.price_usd * rate : null);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
    >
      <div className="absolute top-4 right-4 bg-stone-100 text-stone-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
        {product.category}
      </div>

      <div className="w-full aspect-square bg-stone-50 rounded-xl mb-4 flex items-center justify-center border border-stone-100 overflow-hidden relative">
        <Package className="w-16 h-16 text-stone-200 group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="flex-1 flex flex-col">
        {product.brand && (
          <span className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
            {product.brand}
          </span>
        )}
        <h3 className="text-lg font-bold text-stone-800 leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>

        <div className="text-sm text-stone-500 mb-4">
          {product.weight_kg ? `${product.weight_kg} kg` : product.unit}
        </div>

        <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-500">Precio USD</span>
            <span className="text-lg font-black text-stone-900">
              ${Number(product.price_usd).toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-medium text-stone-500">Precio BCV</span>
            {priceBs !== null ? (
              <span className="text-lg font-bold text-primary">
                Bs. {Number(priceBs).toFixed(2)}
              </span>
            ) : (
              <span className="text-sm font-medium text-stone-400 italic">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
