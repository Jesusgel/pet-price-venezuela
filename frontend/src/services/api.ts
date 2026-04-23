import { Product, ExchangeRate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  getProducts: async (search?: string, category?: string): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/products${query}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await res.json();
    return data.map((item: Omit<Product, 'price_usd' | 'price_bs' | 'weight_kg'> & { price_usd: string | number, price_bs: string | number | null, weight_kg: string | number | null }) => ({
      ...item,
      price_usd: Number(item.price_usd),
      price_bs: item.price_bs !== null ? Number(item.price_bs) : null,
      weight_kg: item.weight_kg !== null ? Number(item.weight_kg) : null,
    }));
  },

  getExchangeRate: async (): Promise<ExchangeRate> => {
    const res = await fetch(`${API_BASE_URL}/rate`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await res.json();
    return {
      ...data,
      rate: Number(data.rate)
    };
  }
};
