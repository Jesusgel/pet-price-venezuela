export interface Product {
  id: number;
  name: string;
  price_usd: number;                    // Saco BCV (USD)
  price_usd_retail: number | null;      // Detal BCV (USD)
  price_usd_cash: number | null;        // Saco Efectivo (USD)
  price_usd_retail_cash: number | null; // Detal Efectivo (USD)
  price_bs: number | null;             // Saco en Bs. (calculado con tasa BCV)
  price_bs_retail: number | null;      // Detal en Bs. (calculado con tasa BCV)
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
  price_usd_retail?: number | null;
  price_usd_cash?: number | null;
  price_usd_retail_cash?: number | null;
  category: string;
  brand?: string | null;
  unit: string;
  weight_kg?: number | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  price_usd?: number;
  price_usd_retail?: number | null;
  price_usd_cash?: number | null;
  price_usd_retail_cash?: number | null;
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

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface BrandCreate {
  name: string;
}
