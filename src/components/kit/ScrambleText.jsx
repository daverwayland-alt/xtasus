'use client';
import { useEffect, useState } from 'react';

const GLYPHS = '▓▒░█▌▐◢◣◤◥#@$%&*+=<>/\\|~';

/* Revela texto con efecto "decodificando" — se resuelve de izquierda a derecha.
   El estado guarda para qué texto es cada frame: si el texto cambió, se muestra limpio al instante. */
export function ScrambleText({ text, duration = 900, className, style }) {
  const [frame, setFrame] = useState({ for: text, value: text });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const resolved = Math.floor(p * text.length);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += i < resolved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setFrame({ for: text, value: p < 1 ? s : text });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return (
    <span className={className} style={style} aria-label={text}>
      {frame.for === text ? frame.value : text}
    </span>
  );
}
