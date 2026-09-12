import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Product, ExchangeRate } from '@/types';

const mockProduct: Product = {
  id: 1,
  name: 'Dog Chow Adultos Razas Medianas y Grandes',
  price_usd: 15.5,
  price_bs: null,
  category: 'Perros',
  brand: 'Purina',
  unit: 'kg',
  weight_kg: 15,
  is_active: true,
};

const mockRateData: ExchangeRate = {
  id: 10,
  rate: 36.5,
  rate_date: '2026-09-12',
  source: 'BCV',
  fetched_at: '2026-09-12T09:00:00Z',
};

describe('ProductDetailModal', () => {
  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <ProductDetailModal
        isOpen={false}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza la información completa del producto cuando isOpen es true', () => {
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
      />
    );

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.category)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.brand!)).toBeInTheDocument();
    expect(screen.getByText('15 kg')).toBeInTheDocument();
  });

  it('muestra el precio en USD y calcula el precio en Bs con la tasa oficial', () => {
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
      />
    );

    // 15.50 USD
    expect(screen.getByText('$15.50')).toBeInTheDocument();

    // 15.50 * 36.50 = 565,75 Bs
    expect(screen.getByText(/565,75/)).toBeInTheDocument();
  });

  it('muestra la tasa oficial y la fecha oficial formateada como DD/MM/YYYY', () => {
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
      />
    );

    // Tasa en formato VE
    expect(screen.getByText('Bs. 36,50')).toBeInTheDocument();

    // Fecha: '2026-09-12' -> '12/09/2026'
    expect(screen.getByText('12/09/2026')).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en el botón de cerrar', () => {
    const handleClose = vi.fn();
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={handleClose}
        product={mockProduct}
        rateData={mockRateData}
      />
    );

    const closeButton = screen.getByLabelText('Cerrar detalle');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={handleClose}
        product={mockProduct}
        rateData={mockRateData}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
