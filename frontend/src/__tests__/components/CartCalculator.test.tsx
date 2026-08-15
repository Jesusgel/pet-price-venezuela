import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import userEvent from '@testing-library/user-event';
import { Product } from '@/types';

// Mock TanStack Query hooks and Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: () => ({
    data: { rate: 478.58, rate_date: '2026-08-15', source: 'dolarapi' },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    data: {
      items: [
        {
          id: 1,
          name: 'Gatsy Adulto 2kg',
          price_usd: 5.0,
          price_bs: null,
          category: 'gato',
          brand: 'Gatsy',
          unit: 'bolsa',
          weight_kg: 2,
          is_active: true,
        },
      ],
      total: 1,
    },
    isLoading: false,
  }),
}));

const testProduct: Product = {
  id: 10,
  name: 'Dog Chow Adulto 1kg',
  price_usd: 10.0,
  price_bs: null,
  category: 'perro',
  brand: 'Dog Chow',
  unit: 'bolsa',
  weight_kg: 1,
  is_active: true,
};

function TestComponent() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalUsd } = useCart();
  return (
    <div>
      <span data-testid="count">{cartItems.length}</span>
      <span data-testid="totalUsd">{totalUsd}</span>
      <button onClick={() => addToCart(testProduct, 1)}>Add</button>
      <button onClick={() => updateQuantity(testProduct.id, 3)}>Update</button>
      <button onClick={() => removeFromCart(testProduct.id)}>Remove</button>
      <button onClick={clearCart}>Clear</button>
    </div>
  );
}

describe('CartContext & Presupuesto state logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides empty cart by default', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('totalUsd').textContent).toBe('0');
  });

  it('adds item to cart and calculates totalUsd', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await userEvent.click(screen.getByText('Add'));

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('totalUsd').textContent).toBe('10');
  });

  it('updates item quantity correctly', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await userEvent.click(screen.getByText('Add'));
    await userEvent.click(screen.getByText('Update'));

    expect(screen.getByTestId('totalUsd').textContent).toBe('30');
  });

  it('clears cart correctly', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await userEvent.click(screen.getByText('Add'));
    await userEvent.click(screen.getByText('Clear'));

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('totalUsd').textContent).toBe('0');
  });
});
