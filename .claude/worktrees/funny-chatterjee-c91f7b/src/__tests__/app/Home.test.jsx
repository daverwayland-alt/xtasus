import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('motion/react', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, className, style, onClick, ...rest }) =>
        React.createElement('div', { className, style, onClick }, children),
      h1: ({ children, className }) =>
        React.createElement('h1', { className }, children),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useMotionValue: (v) => ({ set: vi.fn(), get: () => v }),
    useTransform: () => 0,
  };
});

vi.mock('@/components/UI/BackgroundOrbs', () => ({
  BackgroundOrbs: () => React.createElement('div', { 'data-testid': 'bg-orbs' }),
}));

vi.mock('@/components/UI/GlassCard', () => ({
  GlassCard: ({ children, className, onClick }) =>
    React.createElement('div', { className, onClick, 'data-testid': 'glass-card' }, children),
}));

// ── Importar después de los mocks ──────────────────────────────────────────────
import Home from '@/app/page';

describe('Home (página principal)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('se renderiza sin errores', () => {
    expect(() => render(<Home />)).not.toThrow();
  });

  it('muestra el título "Xtasis"', () => {
    render(<Home />);
    expect(screen.getByText('Xtasis')).toBeInTheDocument();
  });

  it('muestra el botón "Jugar"', () => {
    render(<Home />);
    expect(screen.getByText('Jugar')).toBeInTheDocument();
  });

  it('muestra el botón "Unirse"', () => {
    render(<Home />);
    expect(screen.getByText('Unirse')).toBeInTheDocument();
  });

  it('muestra el botón "Ajustes"', () => {
    render(<Home />);
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
  });

  it('renderiza el componente BackgroundOrbs', () => {
    render(<Home />);
    expect(screen.getByTestId('bg-orbs')).toBeInTheDocument();
  });

  it('el modal de unirse NO está visible al inicio', () => {
    render(<Home />);
    expect(screen.queryByText('Unirse a la Magia')).not.toBeInTheDocument();
  });

  it('abrir el modal al hacer click en "Unirse"', async () => {
    render(<Home />);
    const joinBtn = screen.getByText('Unirse');
    await userEvent.click(joinBtn);
    expect(screen.getByText('Unirse a la Magia')).toBeInTheDocument();
  });

  it('cerrar el modal con el botón ✕', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));
    expect(screen.getByText('Unirse a la Magia')).toBeInTheDocument();

    const closeBtn = screen.getByText('✕');
    await userEvent.click(closeBtn);
    expect(screen.queryByText('Unirse a la Magia')).not.toBeInTheDocument();
  });

  it('el input de código convierte a mayúsculas', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));

    const input = screen.getByPlaceholderText('CÓDIGO');
    await userEvent.type(input, 'abcd');
    expect(input.value).toBe('ABCD');
  });

  it('muestra error si el código tiene menos de 4 caracteres', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));

    const input = screen.getByPlaceholderText('CÓDIGO');
    await userEvent.type(input, 'AB');

    const submitBtn = screen.getByText('Entrar');
    await userEvent.click(submitBtn);

    expect(screen.getByText('El código debe tener 4 caracteres')).toBeInTheDocument();
  });

  it('muestra error si el input está vacío al intentar unirse', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));

    const submitBtn = screen.getByText('Entrar');
    await userEvent.click(submitBtn);

    expect(screen.getByText('El código debe tener 4 caracteres')).toBeInTheDocument();
  });

  it('limpia el error al escribir en el input', async () => {
    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));

    // Generar error
    await userEvent.click(screen.getByText('Entrar'));
    expect(screen.getByText('El código debe tener 4 caracteres')).toBeInTheDocument();

    // Escribir limpia el error
    const input = screen.getByPlaceholderText('CÓDIGO');
    await userEvent.type(input, 'A');
    expect(screen.queryByText('El código debe tener 4 caracteres')).not.toBeInTheDocument();
  });

  it('redirige al lobby con código válido de 4 caracteres', async () => {
    const pushMock = vi.fn();
    const { useRouter } = await import('next/navigation');
    useRouter.mockReturnValue({ push: pushMock });

    render(<Home />);
    await userEvent.click(screen.getByText('Unirse'));

    const input = screen.getByPlaceholderText('CÓDIGO');
    await userEvent.type(input, 'ABCD');
    await userEvent.click(screen.getByText('Entrar'));

    expect(pushMock).toHaveBeenCalledWith('/lobby/ABCD');
  });

  it('Jugar llama a fetch POST /api/game', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'WXYZ' }),
    });

    render(<Home />);
    const playBtn = screen.getByText('Jugar');
    await userEvent.click(playBtn);

    expect(global.fetch).toHaveBeenCalledWith('/api/game', { method: 'POST' });
  });

  it('Jugar muestra spinner de carga', async () => {
    // Fetch que nunca resuelve para mantener loading=true
    global.fetch.mockReturnValueOnce(new Promise(() => {}));

    render(<Home />);
    const playBtn = screen.getByText('Jugar');
    await userEvent.click(playBtn);

    expect(document.querySelector('.loading')).toBeInTheDocument();
  });
});
