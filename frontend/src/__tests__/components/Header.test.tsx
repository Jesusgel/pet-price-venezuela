import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Stubs de dependencias externas
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
      React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock del hook para controlar su estado desde los tests
vi.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: vi.fn(),
}));

import { useExchangeRate } from '@/hooks/useExchangeRate';
import { Header } from '@/components/Header';

// ---------------------------------------------------------------------------
// Header — estados del hook
// ---------------------------------------------------------------------------
describe('Header — estado de carga', () => {
  it('muestra el skeleton (animate-pulse) mientras carga', () => {
    vi.mocked(useExchangeRate).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useExchangeRate>);

    const { container } = render(<Header />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('Header — estado de error', () => {
  it('muestra "Error" cuando isError = true', () => {
    vi.mocked(useExchangeRate).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useExchangeRate>);

    render(<Header />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

describe('Header — estado exitoso', () => {
  it('muestra la tasa BCV formateada con dos decimales', () => {
    vi.mocked(useExchangeRate).mockReturnValue({
      data: { rate: 36.5, rate_date: '2024-01-15', source: 'BCV', fetched_at: '2024-01-15T12:00:00Z' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useExchangeRate>);

    render(<Header />);

    expect(screen.getByText('Bs. 36.50')).toBeInTheDocument();
  });

  it('muestra la fecha de la tasa en formato dd/mm/yyyy', () => {
    vi.mocked(useExchangeRate).mockReturnValue({
      data: { rate: 36.5, rate_date: '2024-01-15', source: 'BCV', fetched_at: '2024-01-15T12:00:00Z' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useExchangeRate>);

    render(<Header />);

    // El Header muestra "(15/01/2024)" en el label de la tasa
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it('muestra el logo PetPrice', () => {
    vi.mocked(useExchangeRate).mockReturnValue({
      data: { rate: 36.5, rate_date: '2024-01-15', source: 'BCV', fetched_at: '' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useExchangeRate>);

    render(<Header />);

    expect(screen.getByText('Pet')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });
});
