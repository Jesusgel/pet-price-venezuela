export interface Product {
  id: number;
  name: string;
  price_usd: number;
  price_bs: number | null;
  category: string;
  brand: string | null;
  unit: string;
  weight_kg: number | null;
  is_active: boolean;
}

export interface ExchangeRate {
  id?: number;
  rate: number;
  rate_date: string;
  source: string;
  fetched_at: string;
}

export interface ExchangeRateUpdate {
  rate: number;
}

export interface PaginatedRateResponse {
  items: ExchangeRate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductCreate {
  name: string;
  price_usd: number;
  category: string;
  brand?: string | null;
  unit: string;
  weight_kg?: number | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  price_usd?: number;
  category?: string;
  brand?: string | null;
  unit?: string;
  weight_kg?: number | null;
  is_active?: boolean;
}

export interface PaginatedResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type SortField = 'name' | 'price_usd' | 'category' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface CartItem {
  product: Product;
  quantity: number;
}

