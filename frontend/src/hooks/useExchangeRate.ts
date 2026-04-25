import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: () => api.getExchangeRate(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
  });
}
