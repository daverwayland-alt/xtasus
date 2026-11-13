import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock motion/react antes de importar el componente
vi.mock('motion/react', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, onMouseMove, onMouseEnter, onMouseLeave, className, style, ...rest }, ref) =>
        React.createElement('div', { ref, className, style, onMouseMove, onMouseEnter, onMouseLeave, 'data-testid': rest['data-testid'] }, children)
      ),
    },
    useMotionValue: (initial) => ({ set: vi.fn(), get: () => initial }),
    useTransform: (_val, _from, _to) => 0,
  };
});

import { GlassCard } from '@/components/UI/GlassCard';

describe('GlassCard', () => {
  it('renderiza los children correctamente', () => {
    render(<GlassCard><span>Contenido</span></GlassCard>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('aplica className adicional', () => {
    const { container } = render(<GlassCard className="mi-clase">Texto</GlassCard>);
    expect(container.firstChild).toHaveClass('mi-clase');
  });

  it('incluye clases de glassmorphism base', () => {
    const { container } = render(<GlassCard>Texto</GlassCard>);
    const card = container.firstChild;
    expect(card.className).toMatch(/rounded-3xl/);
    expect(card.className).toMatch(/backdrop-blur/);
  });

  it('sin tilt: no muestra el glow al hacer hover', () => {
    const { container } = render(<GlassCard tilt={false}>Texto</GlassCard>);
    fireEvent.mouseEnter(container.firstChild);
    // No debe haber div de glow (solo el glossy top edge y el children wrapper)
    const divs = container.querySelectorAll('div');
    // El glow solo existe con tilt=true e isHovered=true
    expect(container.querySelector('[class*="blur-[80px]"]')).toBeNull();
  });

  it('con tilt: muestra el glow al hacer mouseEnter', () => {
    const { container } = render(
      <GlassCard tilt={true} glowColor="rgba(255,0,0,0.5)">Texto</GlassCard>
    );
    fireEvent.mouseEnter(container.firstChild);
    // El div de glow tiene blur-[80px] y pointer-events-none
    const glowEl = container.querySelector('.blur-\\[80px\\]');
    expect(glowEl).toBeInTheDocument();
  });

  it('con tilt: oculta el glow al hacer mouseLeave', () => {
    const { container } = render(
      <GlassCard tilt={true}>Texto</GlassCard>
    );
    fireEvent.mouseEnter(container.firstChild);
    fireEvent.mouseLeave(container.firstChild);
    expect(container.querySelector('.blur-\\[80px\\]')).toBeNull();
  });

  it('renderiza el highlight de borde superior', () => {
    const { container } = render(<GlassCard>Texto</GlassCard>);
    const topEdge = container.querySelector('.inset-x-0.top-0.h-px');
    expect(topEdge).toBeInTheDocument();
  });

  it('los children están dentro del wrapper z-10', () => {
    render(<GlassCard><p data-testid="child">Hijo</p></GlassCard>);
    const child = screen.getByTestId('child');
    const wrapper = child.closest('.relative.z-10');
    expect(wrapper).toBeInTheDocument();
  });
});
