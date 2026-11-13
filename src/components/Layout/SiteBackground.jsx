'use client';
import { useEffect, useRef } from 'react';

/* Burbujas de champán: valores fijos (no aleatorios) para evitar desajustes de hidratación. */
const BUBBLES = [
  [6, 7, 11, 0], [14, 12, 15, -6], [22, 5, 9, -3], [31, 9, 13, -10], [39, 14, 17, -2], [47, 6, 10, -8],
  [55, 10, 14, -5], [63, 13, 18, -12], [71, 5, 12, -1], [79, 9, 16, -9], [86, 12, 13, -4], [93, 7, 11, -7],
  [18, 16, 21, -14], [67, 8, 19, -11], [44, 11, 20, -16], [9, 6, 22, -18],
];

/* Fondo de bar de noche: terciopelo con color por nivel (vía CSS vars), abanico art déco,
   burbujas de champán, grano de película y un halo cálido que sigue al dedo/cursor. */
export default function SiteBackground() {
  const glow = useRef(null);

  useEffect(() => {
    const el = glow.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const move = e => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          raf = 0;
        });
      }
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="site-bg" aria-hidden="true">
        <div className="site-blob site-blob-a" />
        <div className="site-blob site-blob-b" />
        <div className="site-blob site-blob-c" />
        <div className="site-deco" />
        {BUBBLES.map(([left, size, dur, delay], i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              '--sway': `${i % 2 ? 18 : -18}px`,
            }}
          />
        ))}
      </div>
      <div ref={glow} className="cursor-glow" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
