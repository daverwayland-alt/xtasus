'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { LuMinus, LuPlus, LuTrash2, LuEye, LuScrollText } from 'react-icons/lu';
import { Btn } from '@/components/kit/Btn';
import { Sheet } from '@/components/kit/Drawer';
import { Avatar } from '@/components/kit/Avatar';
import { Ticker } from '@/components/kit/Ticker';
import { feel } from '@/lib/feedback';
import { DARE_STREAK_GOAL } from '@/data/tools';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

/* ═══════════ Sustancias ═══════════ */
export function ToolsSheet({ open, onOpenChange, tools, streak = 0, anyFallen = true, busy, onUse }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Mi barra" subtitle={`${tools.length ? `${tools.length} cóctel${tools.length !== 1 ? 'es' : ''}` : 'Barra vacía'} · racha ${streak}/${DARE_STREAK_GOAL} retos para ganar otro`}>
      <div className="flex flex-col gap-2">
        {tools.length === 0 && <p className="text-center py-6 text-sm" style={{ color: 'var(--muted)' }}>Ya te bebiste toda la carta ✦</p>}
        {tools.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={busy}
            className="tile flex items-center gap-3"
            onClick={() => { feel('pop', 'medium'); onUse(t); }}>
            <span className="text-3xl leading-none"><PlayerSymbol symbol={t.emoji} /></span>
            <div className="flex-1 min-w-0">
              <p className="tile-title">{t.name}</p>
              <p className="tile-sub">{t.description}</p>
            </div>
            <span className="chip">{t.effect === 'revive' && !anyFallen ? 'Nadie ha caído' : t.requiresTarget ? 'Elegir' : 'Usar'}</span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}

/* ═══════════ Leyes ═══════════ */
export function RulesSheet({ open, onOpenChange, rules, players, isHost, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="📜 Leyes de la mesa" subtitle="Reglas vigentes para toda la noche. Máximo 5: la nueva reemplaza a la más vieja.">
      <div className="flex flex-col gap-2 mb-4">
        {rules.length === 0 && (
          <p className="text-center py-5 text-sm" style={{ color: 'var(--muted)' }}>
            Aún no hay leyes. Ejemplo: “nadie puede decir ‘no’ ”.
          </p>
        )}
        {rules.map((r, i) => (
          <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="panel-2 flex items-center gap-3" style={{ padding: '0.7rem 0.9rem' }}>
            <span className="font-display text-lg font-black" style={{ color: 'var(--accent)' }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{r.text}</p>
              <p className="text-[0.65rem]" style={{ color: 'var(--muted)' }}>por {players.find(p => p.id === r.by)?.name ?? '—'}</p>
            </div>
            {isHost && (
              <Btn variant="ghost" size="sm" icon aria-label="Derogar" onClick={() => onRemove(r.id)}>
                <LuTrash2 size={14} />
              </Btn>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          style={{ fontSize: '0.9rem' }}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Escribe una nueva ley…"
          maxLength={90}
        />
        <Btn variant="acid" icon onClick={submit} disabled={!text.trim()} aria-label="Decretar">
          <LuScrollText size={18} />
        </Btn>
      </div>
    </Sheet>
  );
}

/* ═══════════ Misión secreta (mantén para ver) ═══════════ */
export function MissionSheet({ open, onOpenChange, mission, onDone }) {
  const [peek, setPeek] = useState(false);
  return (
    <Sheet open={open} onOpenChange={o => { setPeek(false); onOpenChange(o); }} title="🕵️ Misión secreta" subtitle="Nadie más la ve. Cúmplela sin que te descubran.">
      {!mission ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>No tienes misión asignada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            className="panel-2 text-left relative overflow-hidden"
            style={{ padding: '1.4rem', cursor: 'pointer', color: 'var(--paper)', touchAction: 'none' }}
            onPointerDown={() => { setPeek(true); feel('tick', 'tick'); }}
            onPointerUp={() => setPeek(false)}
            onPointerLeave={() => setPeek(false)}
            onPointerCancel={() => setPeek(false)}
            aria-label="Mantén presionado para ver tu misión">
            <p className="font-display text-base font-bold leading-snug" style={{ filter: peek ? 'none' : 'blur(11px)', transition: 'filter .15s', userSelect: 'none' }}>
              {mission.text}
            </p>
            {!peek && (
              <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                <LuEye size={16} /> Mantén para ver
              </span>
            )}
          </button>
          {mission.done ? (
            <p className="text-center font-display text-sm font-extrabold uppercase" style={{ color: 'var(--acid)' }}>✓ Misión cumplida</p>
          ) : (
            <Btn variant="acid" size="xl" full onClick={() => { onDone(); onOpenChange(false); }}>
              ¡La cumplí!
            </Btn>
          )}
        </div>
      )}
    </Sheet>
  );
}

/* ═══════════ Contador de tragos (compartido) ═══════════ */
export function DrinksSheet({ open, onOpenChange, players, drinks, onDrink }) {
  const total = Object.values(drinks).reduce((s, n) => s + n, 0);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Tragos de la noche" subtitle="Sincronizado entre todos los dispositivos">
      <div className="flex items-end gap-2 mb-4">
        <Ticker value={total} className="font-display text-5xl font-black leading-none" style={{ color: 'var(--orange)' }} />
        <span className="eyebrow pb-1.5">en total</span>
      </div>
      <div className="flex flex-col gap-2">
        {players.map(p => {
          const n = drinks[p.id] || 0;
          return (
            <div key={p.id} className="panel-2 flex items-center gap-3" style={{ padding: '0.55rem 0.8rem' }}>
              <Avatar player={p} size="sm" />
              <span className="flex-1 text-sm font-bold truncate">{p.name}</span>
              <Glass level={n} />
              <div className="flex items-center gap-1.5">
                <Btn variant="ghost" size="sm" icon aria-label={`Quitar trago a ${p.name}`} disabled={n === 0} onClick={() => onDrink(p.id, -1)}>
                  <LuMinus size={14} />
                </Btn>
                <Ticker value={n} className="font-display text-base font-black w-6 text-center" />
                <Btn variant="orange" size="sm" icon aria-label={`Sumar trago a ${p.name}`} onClick={() => onDrink(p.id, 1)}>
                  <LuPlus size={14} />
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[0.7rem] mt-4" style={{ color: 'var(--subtle)' }}>
        Va por honor. Si alguien necesita parar, que pare: sube un nivel de agua 💧
      </p>
    </Sheet>
  );
}

function Glass({ level }) {
  const pct = Math.min(1, level / 10);
  return (
    <svg width="24" height="32" viewBox="0 0 24 32" aria-hidden="true" className="shrink-0">
      <path d="M4 3 L6 29 H18 L20 3 Z" fill="rgba(255,255,255,.05)" stroke="var(--line-2)" strokeWidth="1.5" strokeLinejoin="round" />
      <motion.rect
        x="5.4"
        width="13.2"
        rx="1"
        fill="var(--orange)"
        fillOpacity="0.85"
        initial={false}
        animate={{ y: 28 - 24 * pct, height: 24 * pct }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      />
    </svg>
  );
}
