'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ScrambleText } from '@/components/kit/ScrambleText';
import { Pips } from '@/components/kit/Avatar';
import { LEVEL_THEME } from '@/data/party';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

const KINDS = {
  truth: { cls: 'playcard-truth', label: '💭 Verdad', sticker: 'sticker-cyan' },
  dare: { cls: 'playcard-dare', label: '🔥 Reto', sticker: 'sticker-pink' },
  golden: { cls: 'playcard-golden', label: '✨ Carta dorada', sticker: '' },
  random: { cls: 'playcard-random', label: '🎲 Sorpresa', sticker: '' },
};

/* Carta holográfica: borde cónico animado, tilt 3D con el dedo/cursor y texto que se "decodifica". */
export function CardStage({ card, lives = 3, level = 1 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18 });
  const sy = useSpring(my, { stiffness: 220, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-11, 11]);

  const kind = KINDS[card.type] ?? KINDS.random;
  const theme = LEVEL_THEME[level] ?? LEVEL_THEME[1];

  const onMove = e => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        initial={{ rotateY: -100, opacity: 0, scale: 0.86, y: 30 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1, y: 0 }}
        exit={{ rotateY: 70, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 170, damping: 18 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerUp={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', touchAction: 'pan-y' }}
        className={`playcard ${kind.cls}`}>
        <div className="playcard-inner">
          <div className="flex items-center justify-between mb-5 relative z-[1]">
            <span className={`sticker ${kind.sticker}`}>{kind.label}</span>
            <Pips lives={lives} />
          </div>

          <div className="flex-1 flex items-center justify-center relative z-[1]">
            <p className="playcard-text">
              <ScrambleText text={card.text} duration={Math.min(1100, 300 + card.text.length * 9)} />
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 relative z-[1]">
            <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
              <PlayerSymbol symbol={theme.emoji} /> {theme.label}
            </span>
            {card.anon && <span className="sticker sticker-violet">🤫 Anónima</span>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
