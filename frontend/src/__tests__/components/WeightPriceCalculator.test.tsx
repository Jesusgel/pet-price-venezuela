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

describe('WeightPriceCalculator (REQ-012 / REQ-013)', () => {
  it('renderiza el título, el input, los modos y los botones preset', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    expect(screen.getByText('Calculadora de Precio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe el peso deseado')).toBeInTheDocument();
    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('2 kg')).toBeInTheDocument();

    // Modos de precio configurados
    expect(screen.getByText('Saco · BCV')).toBeInTheDocument();
    expect(screen.getByText('Detal · BCV')).toBeInTheDocument();
    expect(screen.getByText('Saco · Efectivo')).toBeInTheDocument();
    expect(screen.getByText('Detal · Efectivo')).toBeInTheDocument();
  });

  it('muestra el precio de referencia en USD y VES para Saco BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    // 8.50 / 1.5 = 5.666... -> $5.67
    expect(screen.getByText('$5.67')).toBeInTheDocument();
    // 5.666... * 36.5 = 206.833... -> Bs. 206,83
    expect(screen.getByText('Bs. 206,83')).toBeInTheDocument();
  });

  it('calcula correctamente al escribir peso en modo Saco BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '0.25' } });

    // 5.6666 * 0.25 = 1.4166... -> $1.42
    expect(screen.getByText('$1.42')).toBeInTheDocument();
    expect(screen.getAllByText(/Bs\. 51,/i).length).toBeGreaterThan(0);
  });

  it('cambia a modo Detal · BCV y calcula directamente por peso', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    // Seleccionar modo Detal BCV ($2.00 / kg)
    fireEvent.click(screen.getByText('Detal · BCV'));

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '2' } });

    // 2.00 * 2 = 4.00 -> $4.00
    expect(screen.getByText('$4.00')).toBeInTheDocument();
    // 4.00 * 36.50 = 146.00 -> Bs. 146,00
    expect(screen.getByText('Bs. 146,00')).toBeInTheDocument();
  });

  it('cambia a modo Efectivo y muestra resultado solo en dólares', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('Saco · Efectivo'));

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '1.5' } });

    // En efectivo $7.50 para 1.5kg -> exactamente $7.50
    expect(screen.getByText('$7.50')).toBeInTheDocument();
    // En modo efectivo no se muestra tasa BCV en el resultado
    expect(screen.queryByText(/Bs\./)).toBeNull();
  });

  it('click en preset rellena el input y actualiza el cálculo', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('500g'));

    const input = screen.getByPlaceholderText('Escribe el peso deseado') as HTMLInputElement;
    expect(input.value).toBe('0.5');

    // 5.6666 * 0.5 = 2.8333... -> $2.83
    expect(screen.getByText('$2.83')).toBeInTheDocument();
  });

  it('no acepta letras ni caracteres especiales en el input', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: '3.5' } });
    expect(input.value).toBe('3.5');
  });

  it('muestra aviso si no hay tasa disponible en modo BCV', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} rate={null} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '1' } });

    expect(screen.getByText('Tasa no disponible')).toBeInTheDocument();
  });
});
