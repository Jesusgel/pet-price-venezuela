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
  rate: number;
  rate_date: string;
  source: string;
  fetched_at: string;
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
