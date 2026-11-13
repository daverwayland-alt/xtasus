'use client';
import { motion } from 'motion/react';
import { feel } from '@/lib/feedback';

export function Switch({ checked, onChange, label, hint, icon }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        feel('click', 'light');
        onChange(!checked);
      }}
      className="panel-2 w-full flex items-center gap-3 text-left"
      style={{ padding: '0.75rem 0.9rem', cursor: 'pointer', color: 'var(--paper)' }}>
      {icon && <span className="text-xl leading-none">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        {hint && (
          <span className="block text-xs" style={{ color: 'var(--muted)' }}>
            {hint}
          </span>
        )}
      </span>
      <span
        className="relative shrink-0"
        style={{
          width: '2.9rem',
          height: '1.7rem',
          borderRadius: 99,
          background: checked ? 'var(--accent)' : 'var(--ink-3)',
          border: '2px solid var(--ink)',
          transition: 'background 0.2s',
        }}>
        <motion.span
          animate={{ x: checked ? '1.2rem' : '0.12rem' }}
          transition={{ type: 'spring', stiffness: 600, damping: 28 }}
          style={{
            position: 'absolute',
            top: '0.12rem',
            width: '1.2rem',
            height: '1.2rem',
            borderRadius: '50%',
            background: checked ? 'var(--accent-ink)' : 'var(--muted)',
          }}
        />
      </span>
    </button>
  );
}
