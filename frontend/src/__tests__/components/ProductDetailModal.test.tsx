import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Product, ExchangeRate } from '@/types';

const mockProduct: Product = {
  id: 1,
  name: 'Dog Chow Adultos Razas Medianas y Grandes',
  price_usd: 15.5,
  price_usd_retail: null,
  price_usd_cash: null,
  price_usd_retail_cash: null,
  price_bs: null,
  price_bs_retail: null,
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

    // 15.50 USD (tarjeta principal y referencia de calculadora)
    expect(screen.getAllByText('$15.50').length).toBeGreaterThanOrEqual(1);

    // 15.50 * 36.50 = 565,75 Bs (tarjeta principal y referencia de calculadora)
    expect(screen.getAllByText(/565,75/).length).toBeGreaterThanOrEqual(1);
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

  it('no muestra botones de Editar y Eliminar si isAdmin es false', () => {
    render(
      <ProductDetailModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
        isAdmin={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByTitle('Editar producto')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar producto')).not.toBeInTheDocument();
  });

  it('muestra botones de Editar y Eliminar cuando isAdmin es true y dispara callbacks al hacer clic', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ProductDetailModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        rateData={mockRateData}
        isAdmin={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const editBtn = screen.getByTitle('Editar producto');
    const deleteBtn = screen.getByTitle('Eliminar producto');

    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockProduct);

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockProduct.id);
  });
});
