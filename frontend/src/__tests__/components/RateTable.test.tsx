import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RateTable } from '@/components/RateTable';
import { ExchangeRate } from '@/types';
import React from 'react';

describe('RateTable Component', () => {
  const mockRates: ExchangeRate[] = [
    {
      id: 1,
      rate: 42.5,
      rate_date: '2026-09-28',
      source: 'manual',
      fetched_at: '2026-09-28T14:30:00Z',
      changed_by_user_id: 1,
      changed_by_username: 'superadmin',
    },
    {
      id: 2,
      rate: 41.8,
      rate_date: '2026-09-27',
      source: 'dolarapi',
      fetched_at: '2026-09-27T10:00:00Z',
      changed_by_user_id: null,
      changed_by_username: null,
    },
    {
      id: 3,
      rate: 40.0,
      rate_date: '2026-09-26',
      source: 'manual',
      fetched_at: '2026-09-26T12:00:00Z',
      changed_by_user_id: 2,
      changed_by_username: null,
    },
  ];

  it('muestra skeletons de carga cuando isLoading es true', () => {
    const { container } = render(<RateTable rates={[]} isLoading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('muestra estado vacío cuando rates es un array vacío', () => {
    render(<RateTable rates={[]} isLoading={false} />);
    expect(
      screen.getByText(/No se encontraron registros de tasas de cambio/i)
    ).toBeInTheDocument();
  });

  it('renderiza la lista de tasas con sus valores y fuentes correspondientes', () => {
    render(<RateTable rates={mockRates} isLoading={false} />);
    expect(screen.getByText(/42.50/)).toBeInTheDocument();
    expect(screen.getByText(/41.80/)).toBeInTheDocument();
    expect(screen.getByText('dolarapi')).toBeInTheDocument();
    expect(screen.getAllByText('manual')).toHaveLength(2);
  });

  it('muestra la etiqueta de usuario auditor en registros manuales con changed_by_username', () => {
    render(<RateTable rates={mockRates} isLoading={false} />);
    expect(screen.getByText('@superadmin')).toBeInTheDocument();
  });

  it('no muestra mención de usuario cuando changed_by_username es null', () => {
    render(<RateTable rates={[mockRates[1]]} isLoading={false} />);
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });
});
