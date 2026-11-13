import { cn } from '@/lib/utils';

const SEPS = ['✦', '◇', '✧', '♡', '✳'];

/* Cinta dorada de bar: texto infinito separado por copas. `items` se duplica para loop sin cortes. */
export function Marquee({ items, className, speed = 26, rotate = 0 }) {
  const row = [...items, ...items];
  return (
    <div className={cn('tape', className)} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }} aria-hidden="true">
      <div className="tape-track" style={{ animationDuration: `${speed}s` }}>
        {row.map((t, i) => (
          <span key={i}>
            {t} <span style={{ fontStyle: 'normal', marginLeft: '0.6rem' }}>{SEPS[i % SEPS.length]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
