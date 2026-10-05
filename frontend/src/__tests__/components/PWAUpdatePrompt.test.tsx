import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

describe('PWAUpdatePrompt (REQ-019)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no renderiza nada si no hay actualización disponible', () => {
    const { container } = render(<PWAUpdatePrompt testForceShow={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el modal bloqueante con advertencia cuando hay actualización disponible', () => {
    render(<PWAUpdatePrompt testForceShow={true} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Actualización Requerida')).toBeInTheDocument();
    expect(
      screen.getByText(/Hemos desplegado una nueva versión con mejoras críticas/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar Ahora/i })).toBeInTheDocument();
  });

  it('no contiene ningún botón para cerrar o evadir la actualización forzosa', () => {
    render(<PWAUpdatePrompt testForceShow={true} />);

    // Solo debe existir el botón de Actualizar Ahora
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /Cerrar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descartar/i })).not.toBeInTheDocument();
  });

  it('ejecuta el callback onUpdate al presionar Actualizar Ahora', () => {
    const onUpdateMock = vi.fn();
    render(<PWAUpdatePrompt testForceShow={true} onUpdate={onUpdateMock} />);

    const updateButton = screen.getByRole('button', { name: /Actualizar Ahora/i });
    fireEvent.click(updateButton);

    expect(onUpdateMock).toHaveBeenCalledTimes(1);
  });
});
