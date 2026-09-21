import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

describe('PWAUpdatePrompt', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no renderiza nada si no hay actualización disponible', () => {
    const { container } = render(<PWAUpdatePrompt testForceShow={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el banner con textos y botones cuando hay actualización disponible', () => {
    render(<PWAUpdatePrompt testForceShow={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Nueva versión disponible')).toBeInTheDocument();
    expect(
      screen.getByText(/Actualiza para ver las últimas mejoras del catálogo y precios/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar notificación/i })).toBeInTheDocument();
  });

  it('permite descartar el banner al presionar el botón de cerrar', () => {
    render(<PWAUpdatePrompt testForceShow={true} />);

    const closeButton = screen.getByRole('button', { name: /Cerrar notificación/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ejecuta el callback onUpdate al presionar Actualizar', () => {
    const onUpdateMock = vi.fn();
    render(<PWAUpdatePrompt testForceShow={true} onUpdate={onUpdateMock} />);

    const updateButton = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(updateButton);

    expect(onUpdateMock).toHaveBeenCalledTimes(1);
  });
});
