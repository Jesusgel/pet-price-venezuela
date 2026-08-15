'use client';

import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ProductRow } from '@/components/ProductRow';
import { ProductRowSkeleton } from '@/components/ProductRowSkeleton';
import { ViewToggle } from '@/components/ViewToggle';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useViewMode } from '@/hooks/useViewMode';
import { ArrowLeft, ArrowRight, ChevronRight, PackageSearch, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductModal } from '@/components/ProductModal';
import { toast } from 'react-hot-toast';
import { Product, ProductCreate, ProductUpdate, SortField, SortOrder } from '@/types';
import Link from 'next/link';

const SORT_OPTIONS: { label: string; field: SortField; order: SortOrder }[] = [
  { label: 'Nombre A→Z',    field: 'name',       order: 'asc'  },
  { label: 'Nombre Z→A',    field: 'name',       order: 'desc' },
  { label: 'Precio ↑',      field: 'price_usd',  order: 'asc'  },
  { label: 'Precio ↓',      field: 'price_usd',  order: 'desc' },
  { label: 'Más recientes', field: 'created_at', order: 'desc' },
  { label: 'Más antiguos',  field: 'created_at', order: 'asc'  },
];

export default function ProductosPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { viewMode, setViewMode } = useViewMode();

  const { field: sortBy, order: sortOrder } = {
    field: SORT_OPTIONS[sortKey].field,
    order: SORT_OPTIONS[sortKey].order,
  };

  useEffect(() => { setPage(1); }, [search, category, sortKey]);

  const { data: paginatedData, isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts(
    search,
    category,
    page,
    sortBy,
    sortOrder,
  );
  const { data: rateData } = useExchangeRate();

  const products = paginatedData?.items ?? [];
  const totalPages = paginatedData?.total_pages ?? 1;
  const totalProducts = paginatedData?.total ?? 0;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Producto eliminado');
      } catch {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleModalSubmit = async (data: unknown) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: data as ProductUpdate });
        toast.success('Producto actualizado');
      } else {
        await createMutation.mutateAsync(data as ProductCreate);
        toast.success('Producto creado');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-4">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-semibold">Gestión de Productos</span>
      </nav>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3 font-display">
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Administra el inventario de alimentos y accesorios. Los precios en Bs se calculan dinámicamente.
          </p>
        </div>

        <div className="flex flex-col w-full md:w-auto gap-4 md:items-end">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateProduct}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-secondary hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Añadir Producto
            </button>
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>

          <div className="flex w-full md:w-auto gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:w-52 px-4 py-2.5 rounded-lg border border-border bg-surface-container-low shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all placeholder:text-outline"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-border bg-surface-container-low shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all text-foreground"
            >
              <option value="">Todas las categorías</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(Number(e.target.value))}
              className="px-4 py-2.5 rounded-lg border border-border bg-surface-container-low shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/25 focus:border-secondary transition-all text-foreground"
            >
              {SORT_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content View (Grid or List) */}
      {isErrorProducts ? (
        <div className="bg-error/5 p-6 rounded-2xl border border-error/20 flex flex-col items-center justify-center text-center">
          <p className="text-error font-semibold mb-1">Hubo un error al cargar los productos</p>
          <p className="text-error/80 text-sm">Asegúrate de que el backend esté en ejecución y reintenta.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingProducts ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-border border-dashed">
              <div className="bg-surface-container p-4 rounded-full mb-4">
                <PackageSearch className="w-8 h-8 text-outline" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1 font-display">No se encontraron productos</h3>
              <p className="text-muted-foreground">Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rate={rateData?.rate}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {isLoadingProducts ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductRowSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-border border-dashed">
              <div className="bg-surface-container p-4 rounded-full mb-4">
                <PackageSearch className="w-8 h-8 text-outline" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1 font-display">No se encontraron productos</h3>
              <p className="text-muted-foreground">Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                rate={rateData?.rate}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoadingProducts && !isErrorProducts && totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando página <span className="font-semibold text-primary">{page}</span> de{' '}
            <span className="font-semibold text-primary">{totalPages}</span>
            {' '}· <span className="font-semibold text-primary">{totalProducts}</span> producto{totalProducts !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-white font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        page === item
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-white border border-border text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-white font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingProduct}
        title={editingProduct ? 'Editar Producto' : 'Añadir Producto'}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </main>
  );
}
