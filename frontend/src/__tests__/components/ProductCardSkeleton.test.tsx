import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';

describe('ProductCardSkeleton', () => {
  it('se renderiza sin errores (smoke test)', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('contiene la clase animate-pulse para la animación de carga', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('muestra elementos placeholder para precio USD y Bs', () => {
    const { container } = render(<ProductCardSkeleton />);
    // Verifica que haya al menos 4 divs placeholder de fondo gris
    const placeholders = container.querySelectorAll('.bg-stone-100, .bg-stone-200');
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
  });
});
