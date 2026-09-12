import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/services/api', () => ({
  api: {
    getExchangeRate: vi.fn(),
  },
}));

import { api } from '@/services/api';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { ExchangeRate } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockRate: ExchangeRate = {
  rate: 36.5,
  rate_date: '2024-01-15',
  source: 'BCV',
  fetched_at: '2024-01-15T12:00:00Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

// ---------------------------------------------------------------------------
// useExchangeRate
// ---------------------------------------------------------------------------
describe('useExchangeRate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna los datos de la tasa BCV cuando la API responde correctamente', async () => {
    vi.mocked(api.getExchangeRate).mockResolvedValue(mockRate);
    const client = createTestQueryClient();

    const { result } = renderHook(() => useExchangeRate(), { wrapper: createWrapper(client) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.rate).toBe(36.5);
    expect(result.current.data?.rate_date).toBe('2024-01-15');
    expect(result.current.data?.source).toBe('BCV');
  });

  it('expone isLoading en true mientras espera la respuesta', () => {
    // La promesa nunca resuelve → estado loading permanente
    vi.mocked(api.getExchangeRate).mockReturnValue(new Promise(() => {}));
    const client = createTestQueryClient();

    const { result } = renderHook(() => useExchangeRate(), { wrapper: createWrapper(client) });

    expect(result.current.isLoading).toBe(true);
  });

  it('expone isError cuando la API falla (tras los 3 reintentos del hook)', async () => {
    // El hook tiene retry:3 a nivel query — este valor tiene precedencia sobre el QueryClient.
    // Usamos un timeout generoso para esperar los 3 reintentos.
    vi.mocked(api.getExchangeRate).mockRejectedValue(new Error('Service unavailable'));
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // retryDelay en 0 para acelerar los reintentos en tests
          retryDelay: 0,
        },
      },
    });

    const { result } = renderHook(() => useExchangeRate(), { wrapper: createWrapper(client) });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
  });

  it('usa la queryKey ["exchangeRate"] para el caché', async () => {
    vi.mocked(api.getExchangeRate).mockResolvedValue(mockRate);
    const client = createTestQueryClient();

    renderHook(() => useExchangeRate(), { wrapper: createWrapper(client) });

    await waitFor(() => {
      const cachedData = client.getQueryData<ExchangeRate>(['exchangeRate']);
      expect(cachedData?.rate).toBe(36.5);
    });
  });
});
