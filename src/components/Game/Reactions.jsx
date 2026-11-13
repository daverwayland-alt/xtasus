'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { REACTIONS } from '@/data/party';
import { feel } from '@/lib/feedback';

let seq = 0;

/* Lluvia de emojis: muestra las reacciones de todos (las del servidor) + la tuya al instante. */
export function useReactionRain(serverReactions, myId) {
  const [floaters, setFloaters] = useState([]);
  const seen = useRef(null);

  const spawn = useCallback((emoji, bias) => {
    const id = ++seq;
    const x = bias ?? 8 + Math.random() * 84;
    setFloaters(f => [...f.slice(-24), { id, emoji, x, drift: (Math.random() - 0.5) * 70, size: 1.6 + Math.random() * 1.2 }]);
    setTimeout(() => setFloaters(f => f.filter(i => i.id !== id)), 2600);
  }, []);

  useEffect(() => {
    if (!serverReactions) return;
    if (seen.current === null) {
      seen.current = new Set(serverReactions.map(r => r.id)); // no reproducir historial al entrar
      return;
    }
    serverReactions.forEach(r => {
      if (seen.current.has(r.id)) return;
      seen.current.add(r.id);
      if (r.pid !== myId) spawn(r.emoji);
    });
  }, [serverReactions, myId, spawn]);

  return { floaters, spawn };
}

export function ReactionRain({ floaters }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 65 }} aria-hidden="true">
      <AnimatePresence>
        {floaters.map(f => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 40, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], y: -window.innerHeight * 0.62, x: f.drift, scale: [0.4, 1.15, 1, 0.9], rotate: f.drift / 3 }}
            transition={{ duration: 2.4, ease: 'easeOut', times: [0, 0.12, 0.75, 1] }}
            style={{ position: 'absolute', left: `${f.x}%`, bottom: '14%', fontSize: `${f.size}rem`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.5))' }}>
            {f.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ReactionBar({ onReact, disabled }) {
  return (
    <div className="panel-2 flex items-center justify-between gap-1" style={{ padding: '0.35rem 0.5rem', borderRadius: 99 }} role="group" aria-label="Reacciones">
      {REACTIONS.map(e => (
        <motion.button
          key={e}
          type="button"
          disabled={disabled}
          whileTap={{ scale: 0.7, rotate: -12 }}
          whileHover={{ scale: 1.25, y: -3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          onClick={() => {
            feel('pop', 'light');
            onReact(e);
          }}
          className="text-xl leading-none p-1.5"
          style={{ background: 'none', border: 0, cursor: 'pointer' }}
          aria-label={`Reaccionar ${e}`}>
          {e}
        </motion.button>
      ))}
    </div>
  );
}
