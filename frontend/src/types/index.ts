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
  changed_by_user_id?: number | null;
}

export interface ExchangeRateUpdate {
  rate: number;
}

export interface RateImpactSample {
  product_name: string;
  price_usd: number;
  old_price_bs: number;
  new_price_bs: number;
  diff_bs: number;
}

export interface RatePreviewResponse {
  current_rate: number;
  proposed_rate: number;
  deviation_pct: number;
  is_high_deviation: boolean;
  sample_impacts: RateImpactSample[];
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
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

