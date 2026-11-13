'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { feel } from '@/lib/feedback';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

/* Gajos de copa: oro, rubí, vino, orquídea, champán, whisky… alternando claro/oscuro */
const PALETTE = ['#dd1749', '#ff4b88', '#831331', '#b90d3f', '#f6a3bc', '#44404d', '#a51f50', '#27232e'];

function arc(cx, cy, r, a0, a1) {
  const rad = a => ((a - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
}

/**
 * Ruleta de turnos. Cuando `targetId` cambia, gira con inercia y se detiene en ese jugador.
 * `onSpinChange(true|false)` avisa al padre para ocultar controles durante el giro.
 */
export function TurnWheel({ players, targetId, onSpinChange, size = 240, lives = {}, initialSpin = false, active = false }) {
  const rot = useMotionValue(0);
  const prevTarget = useRef(null);
  const n = Math.max(players.length, 1);
  const seg = 360 / n;
  const idx = Math.max(0, players.findIndex(p => p.id === targetId));

  useEffect(() => {
    if (!targetId) return;
    const first = prevTarget.current === null;
    prevTarget.current = targetId;
    const center = idx * seg + seg / 2;
    const current = rot.get();
    const base = current - (((current % 360) + 360) % 360);

    if (first && !initialSpin) {
      rot.set(-center);
      return;
    }

    // sentido horario: el ángulo final ≡ -center (mod 360) deja el segmento bajo el puntero (arriba)
    const to = base + 360 * 5 + (360 - center);
    let lastTick = Math.floor(current / seg);
    onSpinChange?.(true);
    const controls = animate(current, to, {
      duration: 2.7,
      ease: [0.1, 0.75, 0.15, 1],
      onUpdate: v => {
        rot.set(v);
        const k = Math.floor(v / seg);
        if (k !== lastTick) {
          lastTick = k;
          feel('tick', 'tick');
        }
      },
      onComplete: () => {
        onSpinChange?.(false);
        feel('reveal', 'medium');
      },
    });
    return () => controls.stop();
  }, [targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const R = 96;
  return (
    <div className="turn-wheel relative mx-auto" style={{ width: size, height: size }}>
      {/* puntero */}
      <div
        className="absolute left-1/2 z-10"
        style={{
          top: -10,
          translate: '-50% 0',
          width: 0,
          height: 0,
          borderLeft: '13px solid transparent',
          borderRight: '13px solid transparent',
          borderTop: '24px solid var(--paper)',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.6))',
        }}
      />
      <motion.svg viewBox="0 0 200 200" style={{ rotate: rot, width: '100%', height: '100%', filter: 'drop-shadow(0 18px 40px rgba(0,0,0,.6))' }}>
        <circle cx="100" cy="100" r="99" fill="var(--ink)" stroke="var(--accent)" strokeWidth="2" />
        {players.map((p, i) => {
          const a0 = i * seg;
          const a1 = a0 + seg;
          const mid = a0 + seg / 2;
          const rad = ((mid - 90) * Math.PI) / 180;
          const tx = 100 + R * 0.66 * Math.cos(rad);
          const ty = 100 + R * 0.66 * Math.sin(rad);
          const dead = (lives[p.id] ?? 1) <= 0;
          return (
            <g key={p.id} opacity={dead ? 0.35 : 1}>
              <path d={arc(100, 100, R, a0, a1)} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.9} stroke="var(--ink)" strokeWidth="2.5" />
              <g transform={`translate(${tx}, ${ty}) rotate(${mid}) translate(-15, -15)`} color="#fff1f6">
                <PlayerSymbol symbol={p.avatar} size={30} />
              </g>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="19" fill="var(--ink)" stroke="var(--paper)" strokeWidth="3" />
        <text x="100" y="101" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="900" fill="var(--paper)" fontFamily="var(--font-display)">
          X
        </text>
      </motion.svg>
      {active && (
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 60px var(--accent-glow)', animation: 'glow-pulse 0.5s ease-in-out infinite' }} />
      )}
    </div>
  );
}
