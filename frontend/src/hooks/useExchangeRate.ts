import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ExchangeRateUpdate } from '@/types';
import { useEffect, useRef } from 'react';

export function useExchangeRate() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['exchangeRate'],
    queryFn: () => api.getExchangeRate(),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 30, // Polling cada 30s en segundo plano
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  const prevRateRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const newRate = query.data?.rate;
    if (newRate !== undefined) {
      if (prevRateRef.current !== undefined && prevRateRef.current !== newRate) {
        // La tasa cambió: invalidar productos e historial para recalcular precios en Bs
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['rateHistory'] });
      }
      prevRateRef.current = newRate;
    }
  }, [query.data?.rate, queryClient]);

  return query;
}

export function useRateHistory(page: number = 1) {
  return useQuery({
    queryKey: ['rateHistory', page],
    queryFn: () => api.getRateHistory(page),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCurrentRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExchangeRateUpdate) => api.updateCurrentRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRate'] });
      queryClient.invalidateQueries({ queryKey: ['rateHistory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRefreshRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.refreshRate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRate'] });
      queryClient.invalidateQueries({ queryKey: ['rateHistory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
