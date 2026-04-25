import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock del módulo api — se reemplaza ANTES de importar los hooks
vi.mock('@/services/api', () => ({
  api: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

import { api } from '@/services/api';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Product } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockProduct: Product = {
  id: 1,
  name: 'Pedigree Adulto',
  price_usd: 12.5,
  price_bs: 456.25,
  category: 'perro',
  brand: 'Pedigree',
  unit: 'kg',
  weight_kg: 2.5,
  is_active: true,
};

/** Crea un QueryClient sin reintentos para tests rápidos. */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

/** HOC wrapper con QueryClientProvider. */
function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

// ---------------------------------------------------------------------------
// useProducts
// ---------------------------------------------------------------------------
describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna los productos cuando la API responde correctamente', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([mockProduct]);
    const client = createTestQueryClient();

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe('Pedigree Adulto');
  });

  it('pasa search y category a api.getProducts', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([]);
    const client = createTestQueryClient();

    renderHook(() => useProducts('pedigree', 'perro'), { wrapper: createWrapper(client) });

    await waitFor(() => expect(api.getProducts).toHaveBeenCalledWith('pedigree', 'perro'));
  });

  it('expone isError cuando la API falla', async () => {
    vi.mocked(api.getProducts).mockRejectedValue(new Error('Network error'));
    const client = createTestQueryClient();

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper(client) });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// useCreateProduct
// ---------------------------------------------------------------------------
describe('useCreateProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a api.createProduct y luego invalida la query "products"', async () => {
    vi.mocked(api.createProduct).mockResolvedValue(mockProduct);
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper(client) });

    result.current.mutate({ name: 'Whiskas', price_usd: 8, category: 'gato', unit: 'lata' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });
});

// ---------------------------------------------------------------------------
// useUpdateProduct
// ---------------------------------------------------------------------------
describe('useUpdateProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a api.updateProduct con id y data, luego invalida "products"', async () => {
    vi.mocked(api.updateProduct).mockResolvedValue({ ...mockProduct, name: 'Pedigree Senior' });
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper(client) });

    result.current.mutate({ id: 1, data: { name: 'Pedigree Senior' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.updateProduct).toHaveBeenCalledWith(1, { name: 'Pedigree Senior' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });
});

// ---------------------------------------------------------------------------
// useDeleteProduct
// ---------------------------------------------------------------------------
describe('useDeleteProduct', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a api.deleteProduct con el id correcto y luego invalida "products"', async () => {
    vi.mocked(api.deleteProduct).mockResolvedValue(undefined);
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper(client) });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.deleteProduct).toHaveBeenCalledWith(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] });
  });
});
