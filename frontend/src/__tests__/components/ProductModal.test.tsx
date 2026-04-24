import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Stub de Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

import { ProductModal } from '@/components/ProductModal';
import { Product } from '@/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  initialData: null,
  title: 'Nuevo Producto',
  isLoading: false,
};

const existingProduct: Product = {
  id: 5,
  name: 'Whiskas Atún',
  price_usd: 8.75,
  price_bs: 319.375,
  category: 'gato',
  brand: 'Whiskas',
  unit: 'lata',
  weight_kg: 0.35,
  is_active: true,
};

// ---------------------------------------------------------------------------
// Visibilidad
// ---------------------------------------------------------------------------
describe('ProductModal — visibilidad', () => {
  it('renderiza el modal cuando isOpen = true', () => {
    render(<ProductModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Nuevo Producto' })).toBeInTheDocument();
  });

  it('NO renderiza nada cuando isOpen = false', () => {
    render(<ProductModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('heading', { name: 'Nuevo Producto' })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Pre-llenado de formulario
// ---------------------------------------------------------------------------
describe('ProductModal — initialData', () => {
  it('pre-llena el formulario con los datos de initialData', () => {
    render(<ProductModal {...defaultProps} initialData={existingProduct} title="Editar Producto" />);

    expect(screen.getByDisplayValue('Whiskas Atún')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8.75')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Whiskas')).toBeInTheDocument();
  });

  it('muestra el formulario vacío cuando no hay initialData', () => {
    render(<ProductModal {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Nombre/i);
    expect((nameInput as HTMLInputElement).value).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------
describe('ProductModal — submit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a onSubmit con los datos del formulario al hacer submit', async () => {
    const onSubmit = vi.fn();
    render(<ProductModal {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/Nombre/i), 'Royal Canin');
    await userEvent.clear(screen.getByLabelText(/Precio USD/i));
    await userEvent.type(screen.getByLabelText(/Precio USD/i), '25.00');
    await userEvent.selectOptions(screen.getByLabelText(/Categoría/i), 'perro');

    await userEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const calledWith = onSubmit.mock.calls[0][0];
    expect(calledWith.name).toBe('Royal Canin');
    expect(calledWith.category).toBe('perro');
  });
});

// ---------------------------------------------------------------------------
// Estado de carga
// ---------------------------------------------------------------------------
describe('ProductModal — isLoading', () => {
  it('muestra "Guardando..." en el botón submit cuando isLoading = true', () => {
    render(<ProductModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Guardando/i })).toBeInTheDocument();
  });

  it('el botón submit queda deshabilitado cuando isLoading = true', () => {
    render(<ProductModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled();
  });

  it('el botón Cancelar queda deshabilitado cuando isLoading = true', () => {
    render(<ProductModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Cierre del modal
// ---------------------------------------------------------------------------
describe('ProductModal — cierre', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a onClose al hacer click en el botón X', async () => {
    const onClose = vi.fn();
    render(<ProductModal {...defaultProps} onClose={onClose} />);

    // El botón X no tiene label visible — lo buscamos por el SVG que contiene
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((b) => !b.textContent?.trim());
    await userEvent.click(closeBtn!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama a onClose al hacer click en el botón Cancelar', async () => {
    const onClose = vi.fn();
    render(<ProductModal {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
