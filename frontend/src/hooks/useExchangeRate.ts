import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ExchangeRateUpdate } from '@/types';

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: () => api.getExchangeRate(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
  });
}

export function useRateHistory(page: number = 1) {
  return useQuery({
    queryKey: ['rateHistory', page],
    queryFn: () => api.getRateHistory(page),
    staleTime: 1000 * 60 * 5,
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
