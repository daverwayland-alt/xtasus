'use client';
import NumberFlow from '@number-flow/react';

/* Número animado (dígitos que ruedan). */
export function Ticker({ value, className, style, prefix, suffix }) {
  return <NumberFlow value={value} className={className} style={style} prefix={prefix} suffix={suffix} />;
}
