import { Product, ExchangeRate, ProductCreate, ProductUpdate, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  getProducts: async (
    search?: string,
    category?: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'name',
    sortOrder: string = 'asc',
  ): Promise<PaginatedResponse> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();
    return {
      ...data,
      items: data.items.map((item: Omit<Product, 'price_usd' | 'price_bs' | 'weight_kg'> & { price_usd: string | number, price_bs: string | number | null, weight_kg: string | number | null }) => ({
        ...item,
        price_usd: Number(item.price_usd),
        price_bs: item.price_bs !== null ? Number(item.price_bs) : null,
        weight_kg: item.weight_kg !== null ? Number(item.weight_kg) : null,
      })),
    };
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
  },

  createProduct: async (product: ProductCreate): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!res.ok) {
      throw new Error('Failed to create product');
    }
    
    return res.json();
  },

  updateProduct: async (id: number, product: ProductUpdate): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!res.ok) {
      throw new Error('Failed to update product');
    }
    
    return res.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete product');
    }
  }
};
