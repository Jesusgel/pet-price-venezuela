'use client';

import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { PackageSearch } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts(search, category);
  const { data: rateData } = useExchangeRate();

  return (
    <>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3">
              Catálogo de Productos
            </h1>
            <p className="text-stone-500 text-lg">
              Los precios en Bolívares se calculan automáticamente con la tasa del BCV en tiempo real.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2.5 rounded-xl border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-stone-700"
            >
              <option value="">Todas</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
            </select>
          </div>
        </div>

        {isErrorProducts ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
            <p className="text-red-600 font-semibold mb-1">Hubo un error al cargar los productos</p>
            <p className="text-red-500 text-sm">Por favor, asegúrate de que el backend esté en ejecución y la conexión sea correcta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : products?.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-100 border-dashed">
                <div className="bg-stone-50 p-4 rounded-full mb-4">
                  <PackageSearch className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-700 mb-1">No se encontraron productos</h3>
                <p className="text-stone-500">Prueba con otra búsqueda o categoría.</p>
              </div>
            ) : (
              products?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  rate={rateData?.rate} 
                />
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
