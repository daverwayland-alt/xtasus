import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('elimina valores falsy', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('aplica clases condicionales con objeto clsx', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('resuelve conflictos de Tailwind (twMerge)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('combina clases condicionales con clases base', () => {
    const isActive = true;
    const result = cn('btn', { 'btn-primary': isActive, 'btn-ghost': !isActive });
    expect(result).toBe('btn btn-primary');
  });

  it('devuelve cadena vacía si no hay argumentos', () => {
    expect(cn()).toBe('');
  });

  it('acepta arrays de clases', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});
