import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProductRow } from '@/components/ProductRow';
import { Product } from '@/types';

// Mock framer-motion para jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
      React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

const mockProduct: Product = {
  id: 1,
  name: 'Alimento Canino Premium 15kg',
  price_usd: 25.0,
  price_usd_retail: null,
  price_usd_cash: null,
  price_usd_retail_cash: null,
  price_bs: null,
  price_bs_retail: null,
  category: 'Perros',
  brand: 'SuperPet',
  unit: 'Saco',
  weight_kg: 15,
  is_active: true,
};

describe('ProductRow Component', () => {
  it('renderiza la información básica del producto', () => {
    render(<ProductRow product={mockProduct} rate={36.5} />);

    expect(screen.getByText('Alimento Canino Premium 15kg')).toBeInTheDocument();
    expect(screen.getByText('15 kg')).toBeInTheDocument();
    expect(screen.getByText('SuperPet')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('no renderiza botones de acción cuando no se pasan onEdit ni onDelete', () => {
    render(<ProductRow product={mockProduct} rate={36.5} />);

    expect(screen.queryByTitle('Editar producto')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar producto')).not.toBeInTheDocument();
  });

  it('renderiza botones de swipe y botones de desktop cuando onEdit y onDelete están presentes', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ProductRow
        product={mockProduct}
        rate={36.5}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    // Botones de swipe
    const editSwipeBtn = screen.getByTitle('Editar producto');
    const deleteSwipeBtn = screen.getByTitle('Eliminar producto');
    expect(editSwipeBtn).toBeInTheDocument();
    expect(deleteSwipeBtn).toBeInTheDocument();

    fireEvent.click(editSwipeBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockProduct);

    fireEvent.click(deleteSwipeBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockProduct.id);
  });

  it('llama a onSelect cuando se hace clic en la fila', () => {
    const handleSelect = vi.fn();

    render(
      <ProductRow
        product={mockProduct}
        rate={36.5}
        onSelect={handleSelect}
      />
    );

    fireEvent.click(screen.getByText('Alimento Canino Premium 15kg'));
    expect(handleSelect).toHaveBeenCalledWith(mockProduct);
  });
});
