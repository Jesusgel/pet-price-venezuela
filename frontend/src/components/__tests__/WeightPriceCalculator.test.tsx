import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightPriceCalculator } from '../WeightPriceCalculator';

// Producto de referencia para los tests:
// 1.5 kg a $8.50, tasa 36.50
// precio_por_kg = 8.50 / 1.5 = $5.666...
// 250g → $1.416... → Bs. 51.XX
// 500g → $2.833... → Bs. 103.XX
// 1 kg → $5.666... → Bs. 206.XX
// 2 kg → $11.333... → Bs. 413.XX
const DEFAULT_PROPS = {
  priceUsd: 8.5,
  weightKg: 1.5,
  rate: 36.5,
  productName: 'Cat Chow 1.5kg',
};

describe('WeightPriceCalculator', () => {
  // ─── Test 1: Render básico ───────────────────────────────────────────────────
  it('renderiza el título, el input y los 4 botones preset', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    expect(
      screen.getByText('Calculadora de Precio por Peso')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Escribe el peso deseado')
    ).toBeInTheDocument();

    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('2 kg')).toBeInTheDocument();
  });

  // ─── Test 2: Precio por kg de referencia ─────────────────────────────────────
  it('muestra el precio por kg correcto en USD y VES', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    // 8.50 / 1.5 = 5.6666... → $5.67
    expect(screen.getByText('$5.67')).toBeInTheDocument();
    // 5.6666 * 36.5 = 206.833... → Bs. 206,83
    expect(screen.getByText('Bs. 206,83')).toBeInTheDocument();
  });

  // ─── Test 3: Escribir peso en input → resultado correcto ──────────────────────
  it('muestra precio correcto al escribir 0.25 en el input', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '0.25' } });

    // 5.6666 * 0.25 = 1.4166... → $1.42
    expect(screen.getByText('$1.42')).toBeInTheDocument();
    // 1.4166 * 36.5 = 51.708... → Bs. 51,71
    expect(screen.getAllByText(/Bs\. 51,/i).length).toBeGreaterThan(0);
  });

  // ─── Test 4: Click en preset rellena el input ─────────────────────────────────
  it('click en preset "500g" rellena el input con 0.5 y muestra resultado', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    fireEvent.click(screen.getByText('500g'));

    const input = screen.getByPlaceholderText(
      'Escribe el peso deseado'
    ) as HTMLInputElement;
    expect(input.value).toBe('0.5');

    // 5.6666 * 0.5 = 2.8333... → $2.83
    expect(screen.getByText('$2.83')).toBeInTheDocument();
  });

  // ─── Test 5: Sincronización preset ↔ input ────────────────────────────────────
  it('resalta el preset "1 kg" al escribir 1 en el input', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '1' } });

    // El botón "1 kg" debe tener la clase activa (bg-secondary)
    const button1kg = screen.getByText('1 kg').closest('button');
    expect(button1kg?.className).toContain('bg-secondary');

    // El botón "500g" NO debe estar activo
    const button500g = screen.getByText('500g').closest('button');
    expect(button500g?.className).not.toContain('bg-secondary');
  });

  it('no resalta ningún preset al escribir 0.7 (valor sin preset)', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '0.7' } });

    const buttons = ['250g', '500g', '1 kg', '2 kg'].map((label) =>
      screen.getByText(label).closest('button')
    );
    buttons.forEach((btn) => {
      expect(btn?.className).not.toContain('bg-secondary');
    });
  });

  // ─── Test 6: Sin tasa disponible ──────────────────────────────────────────────
  it('muestra "Tasa no disponible" en VES cuando rate es null', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} rate={null} />);

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '1' } });

    // Solo debe mostrar USD (aparece en header referencia + resultado: usamos getAllByText)
    expect(screen.getAllByText('$5.67').length).toBeGreaterThanOrEqual(1);
    // VES muestra mensaje de error
    expect(screen.getByText('Tasa no disponible')).toBeInTheDocument();
  });

  // ─── Test 7: Validación de input — no acepta letras ──────────────────────────
  it('no acepta letras ni caracteres especiales en el input', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    const input = screen.getByPlaceholderText(
      'Escribe el peso deseado'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: '1.5$' } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: '2.5' } });
    expect(input.value).toBe('2.5');
  });

  // ─── Test 8: Formato VES correcto ────────────────────────────────────────────
  it('verifica el formato venezolano Bs. X.XXX,XX con separadores correctos', () => {
    // Producto con precio alto para verificar separador de miles
    render(
      <WeightPriceCalculator
        priceUsd={100}
        weightKg={1}
        rate={36.5}
        productName='Producto Caro'
      />
    );

    const input = screen.getByPlaceholderText('Escribe el peso deseado');
    fireEvent.change(input, { target: { value: '10' } });

    // 100 * 10 * 36.5 = 36.500 → Bs. 36.500,00 (punto miles, coma decimales)
    expect(screen.getByText('Bs. 36.500,00')).toBeInTheDocument();
  });

  // ─── Test 9: No renderiza el resultado sin peso válido ───────────────────────
  it('no muestra el panel de resultado cuando el input está vacío', () => {
    render(<WeightPriceCalculator {...DEFAULT_PROPS} />);

    // Sin input, no debe haber un texto con "de Cat Chow" (la etiqueta del resultado)
    expect(screen.queryByText(/de "Cat Chow 1.5kg"/)).not.toBeInTheDocument();
  });
});
