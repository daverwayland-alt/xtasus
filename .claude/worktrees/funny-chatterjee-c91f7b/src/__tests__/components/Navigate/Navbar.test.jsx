import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Navbar from '@/components/Navigate/Navbar';

describe('Navbar', () => {
  it('se renderiza sin errores', () => {
    expect(() => render(<Navbar />)).not.toThrow();
  });

  it('muestra el logo "Xtasis"', () => {
    render(<Navbar />);
    expect(screen.getByText('Xtasis')).toBeInTheDocument();
  });

  it('el logo tiene clase de estilo de título', () => {
    render(<Navbar />);
    const logo = screen.getByText('Xtasis');
    expect(logo).toHaveClass('title-main');
  });

  it('muestra el item de menú "Profile"', () => {
    render(<Navbar />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('muestra el item de menú "Settings"', () => {
    render(<Navbar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('muestra el item de menú "Logout"', () => {
    render(<Navbar />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('contiene el avatar placeholder', () => {
    render(<Navbar />);
    const avatar = screen.getByText('D');
    expect(avatar).toBeInTheDocument();
  });

  it('tiene badge "New" en el item Profile', () => {
    render(<Navbar />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('contiene la clase navbar de DaisyUI', () => {
    const { container } = render(<Navbar />);
    expect(container.querySelector('.navbar')).toBeInTheDocument();
  });
});
