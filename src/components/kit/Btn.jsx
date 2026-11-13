'use client';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { feel } from '@/lib/feedback';

/* Botón con peso físico: spring al presionar + sonido/háptico. */
export function Btn({ className, variant = '', size = '', full, icon, quiet, onClick, children, ...rest }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 700, damping: 22 }}
      className={cn(
        'btn',
        variant && `btn-${variant}`,
        size && `btn-${size}`,
        full && 'btn-full',
        icon && 'btn-icon',
        className,
      )}
      onClick={e => {
        if (!quiet) feel('click', 'light');
        onClick?.(e);
      }}
      {...rest}>
      {children}
    </motion.button>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="anim-spin"
      aria-label="Cargando">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
