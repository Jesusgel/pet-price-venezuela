import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ExchangeRateUpdate } from '@/types';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Obtiene la fecha actual en la zona horaria de Venezuela (UTC-4) en formato YYYY-MM-DD.
 */
export function getVenezuelaDate(): string {
  const now = new Date();
  const vetOffsetMs = -4 * 60 * 60 * 1000;
  const vetDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + vetOffsetMs);
  return vetDate.toISOString().split('T')[0];
}

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
  const prevDateRef = useRef<string | undefined>(undefined);

  // Invalida productos e historial si la tasa o la fecha cambian
  useEffect(() => {
    const newRate = query.data?.rate;
    const newDate = query.data?.rate_date;

    if (newRate !== undefined) {
      if (
        prevRateRef.current !== undefined &&
        (prevRateRef.current !== newRate || (prevDateRef.current && prevDateRef.current !== newDate))
      ) {
        // La tasa o fecha cambió: invalidar productos e historial para recalcular precios en Bs
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['rateHistory'] });
      }
      prevRateRef.current = newRate;
      prevDateRef.current = newDate;
    }
  }, [query.data?.rate, query.data?.rate_date, queryClient]);

  // Detección proactiva de cambio de día al abrir la app o regresar a ella (PWA resume / window focus)
  const checkDayChange = useCallback(() => {
    const currentRateDate = query.data?.rate_date;
    if (currentRateDate && currentRateDate < getVenezuelaDate()) {
      query.refetch();
    }
  }, [query]);

  useEffect(() => {
    checkDayChange();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDayChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkDayChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkDayChange);
    };
  }, [checkDayChange]);

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
