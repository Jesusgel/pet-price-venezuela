import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateEditModal } from '@/components/RateEditModal';
import { api } from '@/services/api';
import React from 'react';

vi.mock('@/services/api', () => ({
  api: {
    previewRateChange: vi.fn(),
  },
}));

describe('RateEditModal Component (Rate Guard)', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    currentRate: 38.5,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<RateEditModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('Capa 1: Rechaza valores de tasa anómalos menores a 1.00', async () => {
    render(<RateEditModal {...defaultProps} />);

    const input = screen.getByLabelText(/Nueva Tasa de Cambio/i);
    fireEvent.change(input, { target: { value: '0.45' } });

    const submitBtn = screen.getByRole('button', { name: /Revisar Impacto/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/La tasa debe estar dentro de un rango razonable/i),
    ).toBeInTheDocument();
    expect(api.previewRateChange).not.toHaveBeenCalled();
  });

  it('Capa 2: Consulta preview y muestra cálculo de impacto', async () => {
    (api.previewRateChange as ReturnType<typeof vi.fn>).mockResolvedValue({
      current_rate: 38.5,
      proposed_rate: 40.0,
      deviation_pct: 3.9,
      is_high_deviation: false,
      sample_impacts: [
        {
          product_name: 'Alimento Perro 15kg',
          price_usd: 30,
          old_price_bs: 1155,
          new_price_bs: 1200,
          diff_bs: 45,
        },
      ],
    });

    render(<RateEditModal {...defaultProps} />);

    const input = screen.getByLabelText(/Nueva Tasa de Cambio/i);
    fireEvent.change(input, { target: { value: '40.00' } });

    const previewBtn = screen.getByRole('button', { name: /Revisar Impacto/i });
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Salvaguarda de Tasa/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Alimento Perro 15kg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aplicar Nueva Tasa/i })).toBeEnabled();
  });

  it('Capa 3: Exige confirmación obligatoria (checkbox) ante alta desviación (> 10%)', async () => {
    (api.previewRateChange as ReturnType<typeof vi.fn>).mockResolvedValue({
      current_rate: 38.5,
      proposed_rate: 55.0,
      deviation_pct: 42.86,
      is_high_deviation: true,
      sample_impacts: [
        {
          product_name: 'Alimento Premium',
          price_usd: 40,
          old_price_bs: 1540,
          new_price_bs: 2200,
          diff_bs: 660,
        },
      ],
    });

    render(<RateEditModal {...defaultProps} />);

    const input = screen.getByLabelText(/Nueva Tasa de Cambio/i);
    fireEvent.change(input, { target: { value: '55.00' } });

    const previewBtn = screen.getByRole('button', { name: /Revisar Impacto/i });
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText(/¡Variación crítica detectada/i)).toBeInTheDocument();
    });

    const applyBtn = screen.getByRole('button', { name: /Aplicar Nueva Tasa/i });
    expect(applyBtn).toBeDisabled();

    // Marcar checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(applyBtn).toBeEnabled();

    // Al hacer clic, ejecuta onSubmit con el nuevo valor
    fireEvent.click(applyBtn);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(55.0);
  });
});
