import { Product, ExchangeRate, ProductCreate, ProductUpdate, PaginatedResponse, ExchangeRateUpdate, PaginatedRateResponse, Category, CategoryCreate, Brand, BrandCreate } from '@/types';

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

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

    const res = await fetch(`${getApiBaseUrl()}/products?${params.toString()}`);

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
    const res = await fetch(`${getApiBaseUrl()}/rate`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await res.json();
    return {
      ...data,
      rate: Number(data.rate)
    };
  },

  getRateHistory: async (page: number = 1, limit: number = 20): Promise<PaginatedRateResponse> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    const res = await fetch(`${getApiBaseUrl()}/rate/history?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch rate history');
    }
    const data = await res.json();
    return {
      ...data,
      items: data.items.map((item: ExchangeRate) => ({
        ...item,
        rate: Number(item.rate),
      })),
    };
  },

  updateCurrentRate: async (data: ExchangeRateUpdate): Promise<ExchangeRate> => {
    const res = await fetch(`${getApiBaseUrl()}/rate/current`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Failed to update current rate');
    }
    const updated = await res.json();
    return {
      ...updated,
      rate: Number(updated.rate),
    };
  },

  refreshRate: async (): Promise<ExchangeRate> => {
    const res = await fetch(`${getApiBaseUrl()}/rate/update-rate`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to refresh rate');
    }
    const data = await res.json();
    return {
      ...data,
      rate: Number(data.rate),
    };
  },

  createProduct: async (product: ProductCreate): Promise<Product> => {
    const res = await fetch(`${getApiBaseUrl()}/products/`, {
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
    const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
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
    const res = await fetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete product');
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${getApiBaseUrl()}/categories/`);
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    return res.json();
  },

  createCategory: async (category: CategoryCreate): Promise<Category> => {
    const res = await fetch(`${getApiBaseUrl()}/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      throw new Error('Failed to create category');
    }
    return res.json();
  },

  getBrands: async (): Promise<Brand[]> => {
    const res = await fetch(`${getApiBaseUrl()}/brands/`);
    if (!res.ok) {
      throw new Error('Failed to fetch brands');
    }
    return res.json();
  },

  createBrand: async (brand: BrandCreate): Promise<Brand> => {
    const res = await fetch(`${getApiBaseUrl()}/brands/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brand),
    });
    if (!res.ok) {
      throw new Error('Failed to create brand');
    }
    return res.json();
  }
};
