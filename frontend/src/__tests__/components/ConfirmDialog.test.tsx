import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

describe('ConfirmDialog Component (REQ-022)', () => {
  const defaultProps = {
    isOpen: true,
    title: '¿Confirmar acción?',
    description: 'Esta acción no se puede deshacer.',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza título, descripción y botones cuando isOpen es true', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('¿Confirmar acción?')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('llama a onConfirm al presionar el botón de confirmación', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al presionar el botón de cancelación', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al presionar la tecla Escape', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al hacer clic en el backdrop exterior', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const backdrop = screen.getByRole('alertdialog');
    fireEvent.click(backdrop);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('aplica variante danger con clases correspondientes', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" confirmLabel="Eliminar" />);

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' });
    expect(confirmButton).toHaveClass('bg-error');
  });

  it('deshabilita los botones y muestra spinner cuando isLoading es true', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });

    expect(confirmBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
  });

  it('bloquea el scroll del body al abrirse y lo restaura al desmontarse', () => {
    const { unmount } = render(<ConfirmDialog {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('posiciona el foco inicial seguro en el botón Cancelar', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelBtn);
    });
  });
});
