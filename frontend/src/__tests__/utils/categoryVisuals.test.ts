import { describe, it, expect } from 'vitest';
import { getCategoryVisual } from '@/utils/categoryVisuals';

describe('categoryVisuals — mapeo de emojis y estilos', () => {
  it('retorna emoji de perro para variaciones de perro', () => {
    expect(getCategoryVisual('Perro').emoji).toBe('🐶');
    expect(getCategoryVisual('perros').emoji).toBe('🐶');
    expect(getCategoryVisual('CANINOS').emoji).toBe('🐶');
    expect(getCategoryVisual('Dog Food').emoji).toBe('🐶');
    expect(getCategoryVisual('Cachorros').emoji).toBe('🐶');
  });

  it('retorna emoji de gato para variaciones de gato', () => {
    expect(getCategoryVisual('Gato').emoji).toBe('🐱');
    expect(getCategoryVisual('gatos').emoji).toBe('🐱');
    expect(getCategoryVisual('Felino').emoji).toBe('🐱');
    expect(getCategoryVisual('Cat Chow').emoji).toBe('🐱');
  });

  it('retorna emoji de ganado para variaciones de ganado/vaca/bovino', () => {
    expect(getCategoryVisual('Ganado').emoji).toBe('🐮');
    expect(getCategoryVisual('ganadería').emoji).toBe('🐮');
    expect(getCategoryVisual('Vacas').emoji).toBe('🐮');
    expect(getCategoryVisual('Bovinos').emoji).toBe('🐮');
    expect(getCategoryVisual('Toro').emoji).toBe('🐮');
  });

  it('retorna emoji de aves para variaciones de ave/pájaro', () => {
    expect(getCategoryVisual('Aves').emoji).toBe('🦜');
    expect(getCategoryVisual('pájaros').emoji).toBe('🦜');
    expect(getCategoryVisual('Loros').emoji).toBe('🦜');
  });

  it('retorna emoji de peces para acuáticos', () => {
    expect(getCategoryVisual('Peces').emoji).toBe('🐟');
    expect(getCategoryVisual('Acuario').emoji).toBe('🐟');
    expect(getCategoryVisual('fish').emoji).toBe('🐟');
  });

  it('retorna emoji de caballos para equinos', () => {
    expect(getCategoryVisual('Caballo').emoji).toBe('🐴');
    expect(getCategoryVisual('equinos').emoji).toBe('🐴');
  });

  it('retorna emoji de cerdo para porcinos', () => {
    expect(getCategoryVisual('Porcino').emoji).toBe('🐷');
    expect(getCategoryVisual('cerdos').emoji).toBe('🐷');
  });

  it('retorna huellita genérica para categorías desconocidas o vacías', () => {
    expect(getCategoryVisual('Accesorios').emoji).toBe('🐾');
    expect(getCategoryVisual('Medicamentos').emoji).toBe('🐾');
    expect(getCategoryVisual('').emoji).toBe('🐾');
    expect(getCategoryVisual(null).emoji).toBe('🐾');
    expect(getCategoryVisual(undefined).emoji).toBe('🐾');
  });
});
