import { describe, it, expect } from 'vitest';
import { formatBs, formatBsNumber, formatUSD } from '@/utils/currency';

describe('currency utilities', () => {
  describe('formatBs', () => {
    it('formatea números con punto de miles y coma para decimales', () => {
      expect(formatBs(1234.56)).toBe('Bs. 1.234,56');
      expect(formatBs(36.5)).toBe('Bs. 36,50');
      expect(formatBs(15)).toBe('Bs. 15,00');
    });

    it('formatea cifras grandes de millones con puntos de miles', () => {
      expect(formatBs(1500000.75)).toBe('Bs. 1.500.000,75');
      expect(formatBs(10000000)).toBe('Bs. 10.000.000,00');
    });

    it('maneja valores nulos, undefined y no numéricos de forma segura', () => {
      expect(formatBs(null)).toBe('Bs. 0,00');
      expect(formatBs(undefined)).toBe('Bs. 0,00');
      expect(formatBs('invalido')).toBe('Bs. 0,00');
      expect(formatBs(0)).toBe('Bs. 0,00');
    });

    it('acepta números pasados como string', () => {
      expect(formatBs('1234.50')).toBe('Bs. 1.234,50');
    });
  });

  describe('formatBsNumber', () => {
    it('retorna solo el número sin el prefijo "Bs."', () => {
      expect(formatBsNumber(1234.56)).toBe('1.234,56');
      expect(formatBsNumber(36.5)).toBe('36,50');
    });

    it('maneja nulos devolviendo 0,00', () => {
      expect(formatBsNumber(null)).toBe('0,00');
      expect(formatBsNumber(undefined)).toBe('0,00');
    });
  });

  describe('formatUSD', () => {
    it('formatea números en dólares estándar con coma de miles y punto decimal', () => {
      expect(formatUSD(1234.56)).toBe('$1,234.56');
      expect(formatUSD(15)).toBe('$15.00');
      expect(formatUSD(1500000)).toBe('$1,500,000.00');
    });

    it('maneja nulos y no numéricos', () => {
      expect(formatUSD(null)).toBe('$0.00');
      expect(formatUSD(undefined)).toBe('$0.00');
      expect(formatUSD('invalid')).toBe('$0.00');
    });
  });
});
