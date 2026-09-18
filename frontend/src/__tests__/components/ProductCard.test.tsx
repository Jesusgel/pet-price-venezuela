import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Framer Motion → stub para evitar errores de animación en jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
      React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const baseProduct: Product = {
  id: 1,
  name: 'Pedigree Adulto',
  price_usd: 12.5,
  price_bs: null,
  category: 'perro',
  brand: 'Pedigree',
  unit: 'kg',
  weight_kg: 2.5,
  is_active: true,
};

// ---------------------------------------------------------------------------
// Renderizado básico
// ---------------------------------------------------------------------------
describe('ProductCard — renderizado', () => {
  it('muestra el nombre del producto', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('Pedigree Adulto')).toBeInTheDocument();
  });

  it('muestra la marca del producto', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('Pedigree')).toBeInTheDocument();
  });

  it('muestra la categoría del producto', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('perro')).toBeInTheDocument();
  });

  it('muestra el precio USD formateado', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('$12.50')).toBeInTheDocument();
  });

  it('muestra el peso en kg cuando existe', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('2.5 kg')).toBeInTheDocument();
  });

  it('muestra la unidad cuando no hay peso', () => {
    const product = { ...baseProduct, weight_kg: null, unit: 'lata' };
    render(<ProductCard product={product} rate={undefined} />);
    expect(screen.getByText('lata')).toBeInTheDocument();
  });

  it('muestra el emoji de perro para productos de categoría perro', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getAllByText('🐶').length).toBeGreaterThan(0);
  });

  it('muestra el emoji de gato para productos de categoría gato', () => {
    const catProduct = { ...baseProduct, category: 'gato' };
    render(<ProductCard product={catProduct} rate={undefined} />);
    expect(screen.getAllByText('🐱').length).toBeGreaterThan(0);
  });

  it('muestra el emoji de ganado para productos de categoría ganado', () => {
    const cowProduct = { ...baseProduct, category: 'ganado' };
    render(<ProductCard product={cowProduct} rate={undefined} />);
    expect(screen.getAllByText('🐮').length).toBeGreaterThan(0);
  });

  it('muestra el emoji genérico para otras categorías', () => {
    const otherProduct = { ...baseProduct, category: 'accesorios' };
    render(<ProductCard product={otherProduct} rate={undefined} />);
    expect(screen.getAllByText('🐾').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Lógica de precio en Bs.
// ---------------------------------------------------------------------------
describe('ProductCard — precio en Bs.', () => {
  it('calcula price_bs = price_usd * rate cuando product.price_bs es null', () => {
    // 12.5 * 36.5 = 456.25 -> Bs. 456,25
    render(<ProductCard product={baseProduct} rate={36.5} />);
    expect(screen.getByText('Bs. 456,25')).toBeInTheDocument();
  });

  it('prioriza la tasa activa rate para calcular price_bs reactivamente', () => {
    const product = { ...baseProduct, price_bs: 500.0 };
    render(<ProductCard product={product} rate={36.5} />);
    expect(screen.getByText('Bs. 456,25')).toBeInTheDocument();
  });

  it('usa el price_bs de la API como fallback cuando rate es undefined', () => {
    const product = { ...baseProduct, price_bs: 500.0 };
    render(<ProductCard product={product} rate={undefined} />);
    expect(screen.getByText('Bs. 500,00')).toBeInTheDocument();
  });

  it('muestra "No disponible" cuando no hay rate ni price_bs', () => {
    render(<ProductCard product={baseProduct} rate={undefined} />);
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Acciones — botones editar y eliminar
// ---------------------------------------------------------------------------
describe('ProductCard — acciones', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a onEdit con el producto al hacer click en el botón Editar', async () => {
    const onEdit = vi.fn();
    render(<ProductCard product={baseProduct} rate={36.5} onEdit={onEdit} />);

    await userEvent.click(screen.getByTitle('Editar'));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(baseProduct);
  });

  it('llama a onDelete con el ID al hacer click en el botón Eliminar', async () => {
    const onDelete = vi.fn();
    render(<ProductCard product={baseProduct} rate={36.5} onDelete={onDelete} />);

    await userEvent.click(screen.getByTitle('Eliminar'));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(baseProduct.id);
  });

  it('no renderiza el botón Editar si onEdit no se pasa', () => {
    render(<ProductCard product={baseProduct} rate={36.5} />);
    expect(screen.queryByTitle('Editar')).not.toBeInTheDocument();
  });

  it('no renderiza el botón Eliminar si onDelete no se pasa', () => {
    render(<ProductCard product={baseProduct} rate={36.5} />);
    expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument();
  });
});
