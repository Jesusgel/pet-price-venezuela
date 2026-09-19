import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightPriceCalculator } from '@/components/WeightPriceCalculator';

const DEFAULT_PROPS = {
  priceUsd: 8.5,
  priceUsdRetail: 2.0,
  priceUsdCash: 7.5,
  priceUsdRetailCash: 1.8,
  weightKg: 1.5,
  rate: 36.5,
  productName: 'Cat Chow 1.5kg',
};

describe('WeightPriceCalculator (REQ-012 / REQ-013 — Saco por unidad / Detal por peso)', () => {
  it('en modo Saco inicial muestra input de cantidad sin botones rápidos', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    expect(screen.getByText('Calculadora de Precio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe la cantidad de sacos (ej: 1, 2...)')).toBeInTheDocument();
    expect(screen.getByText('saco(s)')).toBeInTheDocument();

    // No debe haber botones rápidos de gramos para sacos
    expect(screen.queryByText('250g')).toBeNull();
    expect(screen.queryByText('500g')).toBeNull();

    // Modos disponibles
    expect(screen.getByText('Saco · BCV')).toBeInTheDocument();
    expect(screen.getByText('Detal · BCV')).toBeInTheDocument();
    expect(screen.getByText('Saco · Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Detal · Efectivo')).toBeInTheDocument();
  });

  it('muestra el precio unitario por saco en USD y VES para Saco BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    // Precio saco: $8.50
    expect(screen.getByText('$8.50')).toBeInTheDocument();
    // 8.50 * 36.5 = 310.25 -> Bs. 310,25
    expect(screen.getByText('Bs. 310,25')).toBeInTheDocument();
  });

  it('calcula correctamente al escribir cantidad de sacos en modo Saco BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe la cantidad de sacos (ej: 1, 2...)');
    fireEvent.change(input, { target: { value: '2' } });

    // 8.50 * 2 = 17.00
    expect(screen.getByText('$17.00')).toBeInTheDocument();
    // 17.00 * 36.5 = 620.50
    expect(screen.getByText('Bs. 620,50')).toBeInTheDocument();
    expect(screen.getByText(/2 sacos de "Cat Chow 1.5kg"/)).toBeInTheDocument();
  });

  it('cambia a modo Saco · Efectivo y calcula sacos en dólares', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('Saco · Efectivo'));

    const input = screen.getByPlaceholderText('Escribe la cantidad de sacos (ej: 1, 2...)');
    fireEvent.change(input, { target: { value: '3' } });

    // 7.50 * 3 = 22.50
    expect(screen.getByText('$22.50')).toBeInTheDocument();
    expect(screen.queryByText(/Bs\./)).toBeNull();
  });

  it('cambia a modo Detal · BCV, muestra botones rápidos y calcula por peso', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('Detal · BCV'));

    // Ahora sí se muestran los botones rápidos para venta al detal
    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('2 kg')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe el peso deseado')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '2' } });

    // 2.00 * 2 = 4.00 -> $4.00
    expect(screen.getByText('$4.00')).toBeInTheDocument();
    // 4.00 * 36.50 = 146.00 -> Bs. 146,00
    expect(screen.getByText('Bs. 146,00')).toBeInTheDocument();
  });

  it('en modo Detal, click en preset rellena input y actualiza cálculo', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('Detal · BCV'));
    fireEvent.click(screen.getByText('500g'));

    const input = screen.getByPlaceholderText('Escribe el peso deseado') as HTMLInputElement;
    expect(input.value).toBe('0.5');

    // 2.00 * 0.5 = 1.00 -> $1.00
    expect(screen.getByText('$1.00')).toBeInTheDocument();
  });

  it('no acepta letras ni caracteres especiales en el input', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe la cantidad de sacos (ej: 1, 2...)') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: '4' } });
    expect(input.value).toBe('4');
  });

  it('muestra aviso si no hay tasa disponible en modo Saco BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} rate={null} />);

    const input = screen.getByPlaceholderText('Escribe la cantidad de sacos (ej: 1, 2...)');
    fireEvent.change(input, { target: { value: '1' } });

    expect(screen.getByText('Tasa no disponible')).toBeInTheDocument();
  });
});
