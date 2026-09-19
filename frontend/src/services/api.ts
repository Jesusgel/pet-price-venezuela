import {
  Product,
  ExchangeRate,
  ProductCreate,
  ProductUpdate,
  PaginatedResponse,
  ExchangeRateUpdate,
  PaginatedRateResponse,
  Category,
  CategoryCreate,
  Brand,
  BrandCreate,
  TokenResponse,
  UserProfile,
  RatePreviewResponse,
  RateImpactSample,
} from '@/types';

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

/**
 * Helper para peticiones autenticadas: inyecta Bearer token y emite auth:expired si recibe 401.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  return res;
}

export const api = {
  // --- Autenticación ---
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorData = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    return res.json();
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await authFetch(`${getApiBaseUrl()}/auth/me`);
    if (!res.ok) {
      throw new Error('Sesión inválida o expirada');
    }
    return res.json();
  },

  revokeAllSessions: async (): Promise<{ message: string }> => {
    const res = await authFetch(`${getApiBaseUrl()}/auth/revoke-sessions`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Error al revocar las sesiones');
    }
    return res.json();
  },

  // --- Productos ---
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

  createProduct: async (product: ProductCreate): Promise<Product> => {
    const res = await authFetch(`${getApiBaseUrl()}/products/`, {
      method: 'POST',
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to create product');
    }

    return res.json();
  },

  updateProduct: async (id: number, product: ProductUpdate): Promise<Product> => {
    const res = await authFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to update product');
    }

    return res.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    const res = await authFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to delete product');
    }
  },

  // --- Tasas de Cambio ---
  getExchangeRate: async (): Promise<ExchangeRate> => {
    const res = await fetch(`${getApiBaseUrl()}/rate`);

    if (!res.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await res.json();
    return {
      ...data,
      rate: Number(data.rate),
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

  previewRateChange: async (rate: number): Promise<RatePreviewResponse> => {
    const res = await authFetch(`${getApiBaseUrl()}/rate/preview`, {
      method: 'POST',
      body: JSON.stringify({ rate }),
    });
    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to preview rate change');
    }
    const data = await res.json();
    return {
      ...data,
      current_rate: Number(data.current_rate),
      proposed_rate: Number(data.proposed_rate),
      deviation_pct: Number(data.deviation_pct),
      sample_impacts: (data.sample_impacts || []).map((sample: RateImpactSample) => ({
        ...sample,
        price_usd: Number(sample.price_usd),
        old_price_bs: Number(sample.old_price_bs),
        new_price_bs: Number(sample.new_price_bs),
        diff_bs: Number(sample.diff_bs),
      })),
    };
  },

  updateCurrentRate: async (data: ExchangeRateUpdate): Promise<ExchangeRate> => {
    const res = await authFetch(`${getApiBaseUrl()}/rate/current`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to update current rate');
    }
    const updated = await res.json();
    return {
      ...updated,
      rate: Number(updated.rate),
    };
  },

  refreshRate: async (): Promise<ExchangeRate> => {
    const res = await authFetch(`${getApiBaseUrl()}/rate/update-rate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to refresh rate');
    }
    const data = await res.json();
    return {
      ...data,
      rate: Number(data.rate),
    };
  },

  // --- Categorías y Marcas ---
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${getApiBaseUrl()}/categories/`);
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    return res.json();
  },

  createCategory: async (category: CategoryCreate): Promise<Category> => {
    const res = await authFetch(`${getApiBaseUrl()}/categories/`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to create category');
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
    const res = await authFetch(`${getApiBaseUrl()}/brands/`, {
      method: 'POST',
      body: JSON.stringify(brand),
    });
    if (!res.ok) {
      const err = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};
      throw new Error(err.detail || 'Failed to create brand');
    }
    return res.json();
  },
};
