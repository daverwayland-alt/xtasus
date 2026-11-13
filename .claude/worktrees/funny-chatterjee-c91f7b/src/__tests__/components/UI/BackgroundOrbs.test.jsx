import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('motion/react', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, className, style, animate, transition, ...rest }, ref) =>
        React.createElement('div', { ref, className, style, 'data-testid': rest['data-testid'] }, children)
      ),
    },
  };
});

import { BackgroundOrbs } from '@/components/UI/BackgroundOrbs';

describe('BackgroundOrbs', () => {
  it('se renderiza sin errores', () => {
    expect(() => render(<BackgroundOrbs />)).not.toThrow();
  });

  it('aplica levelColor al orbe primario', () => {
    const color = '#ff0077';
    const { container } = render(<BackgroundOrbs levelColor={color} />);
    // El orbe primario tiene style.backgroundColor = levelColor
    const orbs = container.querySelectorAll('div[style]');
    const primaryOrb = Array.from(orbs).find(el =>
      el.style.backgroundColor === color
    );
    expect(primaryOrb).toBeTruthy();
  });

  it('usa color por defecto cuando no se pasa levelColor', () => {
    const { container } = render(<BackgroundOrbs />);
    const orbs = container.querySelectorAll('div[style]');
    const defaultOrb = Array.from(orbs).find(el =>
      el.style.backgroundColor === '#a855f7'
    );
    expect(defaultOrb).toBeTruthy();
  });

  it('contiene el backdrop oscuro', () => {
    const { container } = render(<BackgroundOrbs />);
    const backdrop = container.querySelector('.bg-black');
    expect(backdrop).toBeInTheDocument();
  });

  it('el contenedor principal es fixed e inaccesible al puntero', () => {
    const { container } = render(<BackgroundOrbs />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('fixed');
    expect(wrapper).toHaveClass('pointer-events-none');
  });

  it('tiene índice z negativo (queda detrás del contenido)', () => {
    const { container } = render(<BackgroundOrbs />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toMatch(/z-\[-1\]/);
  });
});
