import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ExchangeRate, ExchangeRateUpdate } from '@/types';
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

// Estado a nivel de sesión del navegador para validar frescura tras comprobación de red
let sessionRateVerified = false;

export function resetSessionRateVerification() {
  sessionRateVerified = false;
}

export function useExchangeRate() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['exchangeRate'],
    queryFn: () => api.getExchangeRate(),
    networkMode: 'online', // AC-01: Sobrescribe el offlineFirst global para requerir validación de red
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 30, // Polling cada 30s en segundo plano
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });

  // Marca como verificada en red cuando la query resuelve un fetch exitoso en esta sesión
  useEffect(() => {
    if (query.isSuccess && (query.isFetchedAfterMount || query.dataUpdatedAt > 0)) {
      sessionRateVerified = true;
    }
  }, [query.isSuccess, query.isFetchedAfterMount, query.dataUpdatedAt]);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // AC-03: Compuerta de frescura (isRateFresh)
  // Se considera fresca si se verificó con el servidor en esta sesión,
  // o si el dispositivo está sin conexión a internet y hay datos cacheados
  const isRateFresh = Boolean(
    query.data && (
      sessionRateVerified ||
      (query.isFetchedAfterMount && query.isSuccess) ||
      !isOnline
    )
  );

  const prevRateRef = useRef<number | undefined>(undefined);
  const prevDateRef = useRef<string | undefined>(undefined);
  const lastDayCheckRef = useRef<number>(0);
  const DAY_CHECK_COOLDOWN_MS = 1000 * 60 * 5; // 5 minutos entre chequeos proactivos

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
    const now = Date.now();
    if (now - lastDayCheckRef.current < DAY_CHECK_COOLDOWN_MS) {
      return;
    }
    const currentRateData = queryClient.getQueryData<ExchangeRate>(['exchangeRate']);
    const currentRateDate = currentRateData?.rate_date;
    if (currentRateDate && currentRateDate < getVenezuelaDate()) {
      lastDayCheckRef.current = now;
      sessionRateVerified = false;
      queryClient.invalidateQueries({ queryKey: ['exchangeRate'] });
    }
  }, [queryClient]);

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

  return {
    ...query,
    isRateFresh,
  };
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
