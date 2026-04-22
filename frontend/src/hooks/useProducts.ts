import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useProducts(search?: string, category?: string) {
  return useQuery({
    queryKey: ['products', search, category],
    queryFn: () => api.getProducts(search, category),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
