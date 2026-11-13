'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Btn } from '@/components/kit/Btn';
import { Avatar } from '@/components/kit/Avatar';
import { VOTE_DURATION_MS } from '@/lib/gameConstants';
import { feel } from '@/lib/feedback';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

const pop = {
  initial: { opacity: 0, scale: 0.8, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

function Shell({ children, accent, className = '' }) {
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div {...pop} className={`sheet ${className}`} style={accent ? { borderColor: accent, boxShadow: `0 0 70px ${accent}55, 0 30px 90px rgba(0,0,0,.7)` } : undefined}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════ Votación: ¿lo cumplió? ═══════════ */
export function VoteOverlay({ voteState, players, myId, onVote, timeLeft }) {
  if (!voteState) return null;
  const target = players.find(p => p.id === voteState.targetId);
  const already = voteState.votes?.[myId];
  const canVote = myId !== voteState.targetId && !already;
  const voters = players.filter(p => p.id !== voteState.targetId);
  const pct = Math.max(0, Math.min(100, (timeLeft * 1000 * 100) / VOTE_DURATION_MS));

  return (
    <Shell accent="var(--accent)">
      <div className="text-center">
        <Avatar player={target} size="xl" active className="mx-auto mb-4" />
        <p className="eyebrow mb-1">El jurado decide</p>
        <h3 className="font-display text-xl font-black uppercase leading-tight">¿{target?.name} lo cumplió?</h3>

        <div className="timer-bar mt-4" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="font-mono text-xs mt-1.5" style={{ color: 'var(--muted)' }}>{timeLeft}s</p>

        <div className="flex justify-center gap-1.5 my-4" aria-label="Votos emitidos">
          {voters.map(v => (
            <span key={v.id} title={v.name} style={{ opacity: voteState.votes?.[v.id] ? 1 : 0.28, transition: 'opacity .2s', fontSize: '1.2rem' }}>
              <PlayerSymbol symbol={v.avatar} />
            </span>
          ))}
        </div>

        {canVote ? (
          <div className="grid grid-cols-2 gap-3">
            <Btn variant="acid" size="xl" onClick={() => { feel('success', 'success'); onVote('yes'); }}>👍 Sí</Btn>
            <Btn variant="pink" size="xl" onClick={() => { feel('fail', 'fail'); onVote('no'); }}>👎 No</Btn>
          </div>
        ) : (
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
            {myId === voteState.targetId ? 'Estás en el banquillo… 😬' : already ? 'Voto registrado ✓' : 'Esperando votos…'}
          </p>
        )}
        {canVote && (
          <p className="text-[0.68rem] mt-3" style={{ color: 'var(--subtle)' }}>Si la mayoría dice que no, pierde una vida.</p>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ Duelo ═══════════ */
export function DuelOverlay({ duelState, players, myId, onVote }) {
  if (!duelState) return null;
  const p1 = players.find(p => p.id === duelState.player1Id);
  const p2 = players.find(p => p.id === duelState.player2Id);
  const isFighter = myId === duelState.player1Id || myId === duelState.player2Id;
  const voted = duelState.votes?.[myId];
  const spectators = players.filter(p => p.id !== duelState.player1Id && p.id !== duelState.player2Id);
  const canVote = !voted && (!isFighter || spectators.length === 0);

  return (
    <Shell accent="var(--orange)">
      <div className="text-center">
        <span className="sticker sticker-orange">⚔️ Duelo mescalínico</span>
        <div className="flex items-center justify-center gap-3 my-5">
          <div className="flex flex-col items-center gap-1.5">
            <Avatar player={p1} size="lg" active />
            <span className="text-xs font-bold">{p1?.name}</span>
          </div>
          <motion.span
            animate={{ scale: [1, 1.25, 1], rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            className="font-display text-2xl font-black rainbow-text">
            VS
          </motion.span>
          <div className="flex flex-col items-center gap-1.5">
            <Avatar player={p2} size="lg" active />
            <span className="text-xs font-bold">{p2?.name}</span>
          </div>
        </div>
        <p className="font-display text-base font-bold leading-snug mb-5 text-balance">{duelState.card?.text}</p>
        {canVote ? (
          <div className="grid grid-cols-2 gap-3">
            <Btn variant="cyan" onClick={() => onVote(duelState.player1Id)}>Gana {p1?.name}</Btn>
            <Btn variant="pink" onClick={() => onVote(duelState.player2Id)}>Gana {p2?.name}</Btn>
          </div>
        ) : (
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
            {voted ? 'Voto registrado ✓' : isFighter ? '¡Dalo todo! El grupo decide…' : 'Esperando veredicto…'}
          </p>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ ¿Vuelves? — oferta al quedarse sin vidas ═══════════ */
export function ReturnOverlay({ state, players, myId, canDecide, lives = 3, onChoice }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!state?.expiresAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [state?.expiresAt]);
  if (!state) return null;
  const ghost = players.find(p => p.id === state.playerId);
  const isGhost = myId === state.playerId || myId === 'offline';
  const secs = state.expiresAt ? Math.max(0, Math.ceil((state.expiresAt - now) / 1000)) : null;

  return (
    <Shell accent="var(--ruby)">
      <div className="text-center">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.8 }} className="text-5xl mb-2"><PlayerSymbol symbol="moon" /></motion.div>
        <span className="sticker">Sin vidas</span>
        {isGhost || canDecide ? (
          <>
            <h3 className="font-display text-xl font-black my-4 text-balance">
              {isGhost ? '¿Vuelves al juego?' : `¿${ghost?.name} vuelve al juego?`}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
              Regresas con {lives} vidas. Si te quedas fuera, la partida sigue con quienes quedan — y una carta poder todavía puede traerte de vuelta.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Btn variant="acid" onClick={() => onChoice(true)}>Volver</Btn>
              <Btn variant="ghost" onClick={() => onChoice(false)}>Quedarme fuera</Btn>
            </div>
          </>
        ) : (
          <p className="text-sm my-5 font-bold" style={{ color: 'var(--muted)' }}>{ghost?.name} decide si vuelve al juego…</p>
        )}
        {secs !== null && <p className="text-xs mt-4 font-mono" style={{ color: 'var(--muted)' }}>{secs} s</p>}
      </div>
    </Shell>
  );
}

/* ═══════════ Subida de nivel ═══════════ */
export function LevelUpOverlay({ data }) {
  useEffect(() => {
    if (data) feel('levelup', 'heavy');
  }, [data]);
  if (!data) return null;
  return (
    <motion.div
      className="overlay"
      style={{ zIndex: 90, background: `radial-gradient(circle at center, ${data.color}33, rgba(4,3,9,.94) 70%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <div className="text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }} className="text-7xl mb-2">
          <PlayerSymbol symbol={data.emoji} />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eyebrow">
          Nivel {data.level}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, scale: 1.8, filter: 'blur(14px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black uppercase leading-none"
          style={{ fontSize: 'clamp(2.6rem, 14vw, 5rem)', color: data.color, textShadow: `0 0 50px ${data.color}` }}>
          {data.label}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 font-semibold" style={{ color: 'var(--muted)' }}>
          {data.tag}
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ═══════════ Evento de caos ═══════════ */
export function ChaosOverlay({ chaos, onDismiss }) {
  useEffect(() => {
    if (chaos) feel('chaos', 'heavy');
  }, [chaos?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!chaos) return null;
  return (
    <Shell accent="var(--pink)">
      <div className="text-center">
        <span className="sticker sticker-pink">🌪️ Evento de caos</span>
        <motion.div
          initial={{ scale: 0, rotate: -270 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 11 }}
          className="text-7xl my-5">
          <PlayerSymbol symbol={chaos.emoji} />
        </motion.div>
        <h3 className="font-display text-xl font-black uppercase mb-2">{chaos.title}</h3>
        <p className="text-base font-semibold leading-relaxed mb-6 text-balance">{chaos.text}</p>
        <Btn variant="pink" size="xl" full onClick={onDismiss}>¡Hecho!</Btn>
      </div>
    </Shell>
  );
}

/* ═══════════ Pausa de agua ═══════════ */
export function WaterOverlay({ water, myId, onAck, alivePlayers = [] }) {
  useEffect(() => {
    if (water) feel('water', 'medium');
  }, [water?.startedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!water) return null;
  const acked = water.acks?.[myId];
  const done = alivePlayers.filter(p => water.acks?.[p.id]).length;
  return (
    <Shell accent="var(--cyan)">
      <div className="text-center relative overflow-hidden">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-3">💧</motion.div>
        <span className="sticker sticker-cyan">Pausa de agua</span>
        <p className="text-base font-semibold leading-relaxed my-5 text-balance">{water.line}</p>
        <div className="timer-bar mb-1" aria-hidden="true">
          <i style={{ width: `${alivePlayers.length ? (done / alivePlayers.length) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--cyan), #7ff)' }} />
        </div>
        <p className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>{done}/{alivePlayers.length} hidratados</p>
        {acked ? (
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Esperando a los demás… 🫶</p>
        ) : (
          <Btn variant="cyan" size="xl" full onClick={onAck}>Ya tomé agua</Btn>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ Selector de objetivo para sustancias ═══════════ */
export function TargetPicker({ tool, players, myId, lives, onPick, onCancel }) {
  if (!tool) return null;
  const reviving = tool.effect === 'revive';
  const candidates = players.filter(p => p.id !== myId && ((lives[p.id] ?? 1) <= 0) === reviving);
  return (
    <Shell accent="var(--violet)">
      <div className="text-center">
        <div className="text-5xl mb-2"><PlayerSymbol symbol={tool.emoji} /></div>
        <h3 className="font-display text-base font-black uppercase">{tool.name}</h3>
        <p className="text-sm mt-1 mb-5" style={{ color: 'var(--muted)' }}>{tool.description} — ¿a quién?</p>
        <div className="grid grid-cols-3 gap-2.5">
          {candidates.map(p => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.88 }}
                whileHover={{ y: -3 }}
                className="panel-2 flex flex-col items-center gap-1.5 py-3"
                style={{ cursor: 'pointer', color: 'var(--paper)' }}
                onClick={() => onPick(p.id)}>
                <Avatar player={p} size="md" />
                <span className="text-[0.7rem] font-bold truncate max-w-full px-1">{p.name}</span>
              </motion.button>
            ))}
        </div>
        <Btn variant="ghost" size="sm" className="mt-5" onClick={onCancel}>Cancelar</Btn>
      </div>
    </Shell>
  );
}

/* ═══════════ Toast de sustancia ═══════════ */
export function ToolToast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div
      className="toast-pill"
      initial={{ opacity: 0, y: -24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}>
      <span className="text-xl"><PlayerSymbol symbol={toast.emoji} /></span>
      <span>{toast.text}</span>
    </motion.div>
  );
}
