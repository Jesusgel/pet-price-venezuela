import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductModal } from '@/components/ProductModal';

// Mock hooks
vi.mock('@/hooks/useProducts', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Perro', is_active: true, created_at: '' },
      { id: 2, name: 'Gato', is_active: true, created_at: '' },
    ],
  }),
  useBrands: () => ({
    data: [
      { id: 1, name: 'Pedigree', is_active: true, created_at: '' },
      { id: 2, name: 'Whiskas', is_active: true, created_at: '' },
    ],
  }),
  useCreateCategory: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 3, name: 'Reptiles' }),
  }),
  useCreateBrand: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 3, name: 'ExoTerra' }),
  }),
}));

describe('ProductModal with dynamic Categories and Brands', () => {
  it('renders categories and brands from hooks in drop-down options', () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
        title="Añadir Producto"
        isLoading={false}
      />
    );

    expect(screen.getByText('Perro')).toBeInTheDocument();
    expect(screen.getByText('Gato')).toBeInTheDocument();
    expect(screen.getByText('Pedigree')).toBeInTheDocument();
    expect(screen.getByText('Whiskas')).toBeInTheDocument();
  });

  it('allows selecting + Crear nueva categoría... to toggle inline text input', () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
        title="Añadir Producto"
        isLoading={false}
      />
    );

    const categorySelect = screen.getByLabelText(/Categoría \*/i);
    fireEvent.change(categorySelect, { target: { value: '__NEW__' } });

    expect(screen.getByPlaceholderText('Nueva categoría...')).toBeInTheDocument();
  });

  it('allows selecting + Crear nueva marca... to toggle inline text input', () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
        title="Añadir Producto"
        isLoading={false}
      />
    );

    const brandSelect = screen.getByLabelText(/Marca/i);
    fireEvent.change(brandSelect, { target: { value: '__NEW__' } });

    expect(screen.getByPlaceholderText('Nueva marca...')).toBeInTheDocument();
  });
});
