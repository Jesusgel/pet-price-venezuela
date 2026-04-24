import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api } from '@/services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockFetch = (body: unknown, ok = true, status = 200) =>
  vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);

// ---------------------------------------------------------------------------
// api.getProducts
// ---------------------------------------------------------------------------
describe('api.getProducts', () => {
  afterEach(() => vi.restoreAllMocks());

  it('convierte price_usd, price_bs y weight_kg de string a number', async () => {
    const raw = [
      {
        id: 1,
        name: 'Pedigree',
        price_usd: '12.50',
        price_bs: '456.25',
        weight_kg: '2.5',
        category: 'perro',
        brand: 'Pedigree',
        unit: 'kg',
        is_active: true,
      },
    ];
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch(raw));

    const result = await api.getProducts();

    expect(result[0].price_usd).toBe(12.5);
    expect(result[0].price_bs).toBe(456.25);
    expect(result[0].weight_kg).toBe(2.5);
  });

  it('maneja price_bs y weight_kg null correctamente', async () => {
    const raw = [
      {
        id: 2,
        name: 'Whiskas',
        price_usd: '8.00',
        price_bs: null,
        weight_kg: null,
        category: 'gato',
        brand: null,
        unit: 'lata',
        is_active: true,
      },
    ];
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch(raw));

    const result = await api.getProducts();

    expect(result[0].price_bs).toBeNull();
    expect(result[0].weight_kg).toBeNull();
  });

  it('pasa search y category como query params', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch([]));

    await api.getProducts('pedigree', 'perro');

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('search=pedigree');
    expect(url).toContain('category=perro');
  });

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch({}, false, 500));

    await expect(api.getProducts()).rejects.toThrow('Failed to fetch products');
  });
});

// ---------------------------------------------------------------------------
// api.getExchangeRate
// ---------------------------------------------------------------------------
describe('api.getExchangeRate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('convierte rate de string a number', async () => {
    const raw = { rate: '36.50', rate_date: '2024-01-15', source: 'BCV', fetched_at: '2024-01-15T12:00:00Z' };
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch(raw));

    const result = await api.getExchangeRate();

    expect(result.rate).toBe(36.5);
    expect(result.rate_date).toBe('2024-01-15');
  });

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch({}, false, 503));

    await expect(api.getExchangeRate()).rejects.toThrow('Failed to fetch exchange rate');
  });
});

// ---------------------------------------------------------------------------
// api.createProduct
// ---------------------------------------------------------------------------
describe('api.createProduct', () => {
  afterEach(() => vi.restoreAllMocks());

  it('realiza POST con Content-Type application/json y el body correcto', async () => {
    const product = { id: 1, name: 'Test', price_usd: 10, price_bs: null, category: 'perro', brand: null, unit: 'kg', weight_kg: null, is_active: true };
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch(product));

    const payload = { name: 'Test', price_usd: 10, category: 'perro', unit: 'kg' };
    await api.createProduct(payload);

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toMatchObject(payload);
  });

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch({}, false, 422));

    await expect(api.createProduct({ name: 'X', price_usd: 1, category: 'gato', unit: 'unidad' })).rejects.toThrow(
      'Failed to create product',
    );
  });
});

// ---------------------------------------------------------------------------
// api.updateProduct
// ---------------------------------------------------------------------------
describe('api.updateProduct', () => {
  afterEach(() => vi.restoreAllMocks());

  it('realiza PUT a la URL con el ID correcto', async () => {
    const updated = { id: 5, name: 'Updated', price_usd: 15, price_bs: null, category: 'gato', brand: null, unit: 'kg', weight_kg: null, is_active: true };
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch(updated));

    await api.updateProduct(5, { name: 'Updated' });

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/products/5');
    expect(options.method).toBe('PUT');
  });

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(mockFetch({}, false, 404));

    await expect(api.updateProduct(99, { name: 'Ghost' })).rejects.toThrow('Failed to update product');
  });
});

// ---------------------------------------------------------------------------
// api.deleteProduct
// ---------------------------------------------------------------------------
describe('api.deleteProduct', () => {
  afterEach(() => vi.restoreAllMocks());

  it('realiza DELETE a la URL con el ID correcto', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn().mockResolvedValue({ ok: true } as Response),
    );

    await api.deleteProduct(3);

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/products/3');
    expect(options.method).toBe('DELETE');
  });

  it('lanza un error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      vi.fn().mockResolvedValue({ ok: false } as Response),
    );

    await expect(api.deleteProduct(99)).rejects.toThrow('Failed to delete product');
  });
});
