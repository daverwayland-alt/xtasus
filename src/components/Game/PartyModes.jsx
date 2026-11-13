'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Btn } from '@/components/kit/Btn';
import { Avatar } from '@/components/kit/Avatar';
import { Sheet } from '@/components/kit/Drawer';
import { feel } from '@/lib/feedback';

const pop = {
  initial: { opacity: 0, scale: 0.8, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

function Shell({ children, accent }) {
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div {...pop} className="sheet" style={{ borderColor: accent, boxShadow: `0 0 70px ${accent}55, 0 30px 90px rgba(0,0,0,.7)` }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

const alivePlayers = (players, lives) => players.filter(p => (lives[p.id] ?? 1) > 0);

/* ═══════════ ¿Quién es más probable? ═══════════ */
export function MltOverlay({ mlt, players, lives, myId, onVote, onClose }) {
  const result = mlt?.phase === 'result' ? mlt.result : null;

  useEffect(() => {
    if (result) {
      feel('success', 'success');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 }, colors: ['#ff3b5c', '#ffe3e8', '#ff2d6f', '#ff4d6d'] });
    }
  }, [!!result]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mlt) return null;
  const alive = alivePlayers(players, lives);
  const mine = mlt.votes?.[myId];
  const amAlive = alive.some(p => p.id === myId);
  const winners = result ? result.winnerIds.map(id => players.find(p => p.id === id)).filter(Boolean) : [];
  const max = result ? Math.max(...Object.values(result.counts)) : 0;

  return (
    <Shell accent="var(--acid)">
      <div className="text-center">
        <span className="sticker">🎯 ¿Quién es más probable?</span>
        <h3 className="font-display text-lg font-black uppercase leading-snug my-4 text-balance">
          …de {mlt.prompt}
        </h3>

        {!result ? (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              {alive.map(p => {
                const picked = mine === p.id;
                const disabled = !!mine || p.id === myId || !amAlive;
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: disabled ? 1 : 0.88 }}
                    whileHover={{ y: disabled ? 0 : -3 }}
                    disabled={disabled && !picked}
                    onClick={() => !disabled && (feel('pop', 'medium'), onVote(p.id))}
                    className="panel-2 flex flex-col items-center gap-1.5 py-3 relative"
                    style={{
                      cursor: disabled ? 'default' : 'pointer',
                      color: 'var(--paper)',
                      borderColor: picked ? 'var(--acid)' : undefined,
                      opacity: p.id === myId ? 0.4 : 1,
                    }}>
                    <Avatar player={p} size="md" active={picked} />
                    <span className="text-[0.7rem] font-bold truncate max-w-full px-1">{p.name}</span>
                    {picked && <span className="absolute top-1 right-1 text-xs">✓</span>}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs font-bold mt-4" style={{ color: 'var(--muted)' }}>
              {mine ? `Votaste ✓ · ${Object.keys(mlt.votes).length}/${alive.length}` : 'Toca a quien creas más probable'}
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 text-left">
              {alive
                .slice()
                .sort((a, b) => (result.counts[b.id] || 0) - (result.counts[a.id] || 0))
                .map(p => {
                  const c = result.counts[p.id] || 0;
                  const win = result.winnerIds.includes(p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-2.5">
                      <Avatar player={p} size="sm" active={win} />
                      <div className="flex-1">
                        <div className="timer-bar" style={{ height: '0.85rem' }}>
                          <motion.i initial={{ width: 0 }} animate={{ width: `${max ? (c / max) * 100 : 0}%` }} transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.15 }}
                            style={{ background: win ? 'linear-gradient(90deg, var(--acid), var(--cyan))' : 'var(--ink-3)', display: 'block', height: '100%' }} />
                        </div>
                      </div>
                      <span className="font-display text-sm font-black w-5 text-right">{c}</span>
                    </div>
                  );
                })}
            </div>
            <p className="font-display text-base font-black uppercase mt-5 mb-1">
              Beben: {winners.map(w => w.name).join(' y ')}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>{winners.length > 1 ? 'Empate: ¡todos los señalados beben!' : 'La mesa ha hablado.'}</p>
            <Btn variant="acid" size="xl" full onClick={onClose}>Seguir jugando</Btn>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ Yo nunca ═══════════ */
export function NhieOverlay({ nhie, players, lives, myId, onAnswer, onClose }) {
  const result = nhie?.phase === 'result' ? nhie.result : null;
  const drinkers = result ? result.drinkers.map(id => players.find(p => p.id === id)).filter(Boolean) : [];

  useEffect(() => {
    if (result) feel(drinkers.length ? 'chaos' : 'success', 'heavy');
  }, [!!result]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!nhie) return null;
  const alive = alivePlayers(players, lives);
  const answered = nhie.answers?.[myId] !== undefined;

  return (
    <Shell accent="var(--cyan)">
      <div className="text-center">
        <span className="sticker sticker-cyan">🙋 Confesión grupal</span>
        <h3 className="font-display text-lg font-black uppercase leading-snug my-4 text-balance">Yo nunca… <br /><span className="rainbow-text">{nhie.prompt}</span></h3>

        {!result ? (
          <>
            {!answered ? (
              <div className="grid grid-cols-2 gap-3">
                <Btn variant="orange" size="xl" onClick={() => { feel('chaos', 'medium'); onAnswer(true); }}>Yo sí</Btn>
                <Btn variant="cyan" size="xl" onClick={() => { feel('success', 'light'); onAnswer(false); }}>😇 Yo no</Btn>
              </div>
            ) : (
              <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Respuesta guardada en secreto ✓</p>
            )}
            <div className="flex justify-center gap-2 mt-5" aria-label="Quién ya respondió">
              {alive.map(p => (
                <span key={p.id} title={p.name} style={{ opacity: nhie.answers?.[p.id] !== undefined ? 1 : 0.25, transition: 'opacity .25s', fontSize: '1.25rem' }}>{p.avatar}</span>
              ))}
            </div>
            <p className="text-xs mt-2 font-mono" style={{ color: 'var(--subtle)' }}>
              {Object.keys(nhie.answers || {}).length}/{alive.length} · se revela cuando todos respondan
            </p>
          </>
        ) : (
          <>
            {drinkers.length === 0 ? (
              <p className="text-base font-bold my-4">Nadie lo ha hecho. ¡Santos de la mesa! 😇</p>
            ) : (
              <>
                <p className="eyebrow mb-3">Beben</p>
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {drinkers.map((p, i) => (
                    <motion.div key={p.id} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 14 }} className="flex flex-col items-center gap-1">
                      <Avatar player={p} size="lg" active />
                      <span className="text-xs font-bold">{p.name}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            <Btn variant="cyan" size="xl" full onClick={onClose}>Seguir jugando</Btn>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ Papa caliente ═══════════ */
export function BombOverlay({ bomb, players, lives, myId, onPass, onCheck, onClose }) {
  const [now, setNow] = useState(() => Date.now());
  const checked = useRef(false);

  useEffect(() => {
    if (!bomb || bomb.phase !== 'live') return;
    checked.current = false;
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, [bomb?.phase, bomb?.startedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = bomb ? bomb.explodesAt - bomb.startedAt : 1;
  const urgency = bomb ? Math.min(1, Math.max(0, (now - bomb.startedAt) / total)) : 0;
  const tickMs = Math.round(900 - urgency * 720);

  /* Cualquier cliente avisa al servidor cuando se acaba la mecha (idempotente) */
  useEffect(() => {
    if (bomb?.phase === 'live' && now >= bomb.explodesAt && !checked.current) {
      checked.current = true;
      onCheck();
    }
  }, [now, bomb, onCheck]);

  /* tic-tac cada vez más rápido */
  useEffect(() => {
    if (!bomb || bomb.phase !== 'live') return;
    const iv = setInterval(() => feel('bomb', 'tick'), tickMs);
    return () => clearInterval(iv);
  }, [bomb?.phase, tickMs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bomb?.phase === 'boom') {
      feel('boom', 'boom');
      confetti({ particleCount: 160, spread: 140, startVelocity: 55, origin: { y: 0.5 }, colors: ['#ff7a1a', '#ff2d4d', '#ffd23d'] });
    }
  }, [bomb?.phase]);

  if (!bomb) return null;
  const holder = players.find(p => p.id === bomb.holderId);
  const loser = players.find(p => p.id === bomb.loserId);
  const amHolder = bomb.holderId === myId;
  const targets = alivePlayers(players, lives).filter(p => p.id !== myId);
  const boom = bomb.phase === 'boom';

  return (
    <Shell accent={boom ? 'var(--red)' : 'var(--orange)'}>
      <div className="text-center">
        <span className="sticker sticker-orange">💣 Papa caliente</span>

        <div className="my-5 relative" style={{ height: '8.5rem' }}>
          <AnimatePresence mode="wait">
            {boom ? (
              <motion.div key="boom" initial={{ scale: 0.2, rotate: -30 }} animate={{ scale: [0.2, 1.5, 1.15], rotate: 0 }} transition={{ duration: 0.6 }} className="text-8xl">
                💥
              </motion.div>
            ) : (
              <motion.div
                key="bomb"
                animate={{ scale: [1, 1 + 0.1 + urgency * 0.12, 1], rotate: urgency > 0.6 ? [-4, 4, -4] : 0 }}
                transition={{ duration: Math.max(0.2, tickMs / 1000), repeat: Infinity }}
                className="text-8xl"
                style={{ filter: `drop-shadow(0 0 ${14 + urgency * 40}px rgba(255,${Math.round(122 - urgency * 80)},26,.9))` }}>
                💣
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {boom ? (
          <>
            <p className="font-display text-xl font-black uppercase mb-1">¡BOOM!</p>
            <div className="flex items-center justify-center gap-2.5 my-3">
              <Avatar player={loser} size="lg" active />
              <span className="font-bold text-left">{loser?.name}<br /><span style={{ color: 'var(--pink)' }}>pierde una vida ❤️‍🔥</span></span>
            </div>
            <Btn variant="orange" size="xl" full onClick={onClose}>Seguir jugando</Btn>
          </>
        ) : (
          <>
            <p className="eyebrow mb-1">Categoría</p>
            <h3 className="font-display text-xl font-black uppercase leading-tight mb-4 text-balance rainbow-text">{bomb.category}</h3>
            {amHolder ? (
              <>
                <p className="text-sm font-bold mb-3" style={{ color: 'var(--orange)' }}>¡La tienes tú! Di uno y pásala 👇</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {targets.map(p => (
                    <motion.button
                      key={p.id}
                      whileTap={{ scale: 0.8 }}
                      className="panel-2 flex flex-col items-center gap-1.5 py-3"
                      style={{ cursor: 'pointer', color: 'var(--paper)' }}
                      onClick={() => { feel('pop', 'medium'); onPass(p.id); }}>
                      <Avatar player={p} size="md" />
                      <span className="text-[0.7rem] font-bold truncate max-w-full px-1">{p.name}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2.5">
                <Avatar player={holder} size="lg" active />
                <p className="font-bold text-left"><span className="text-lg">{holder?.name}</span><br /><span className="text-xs" style={{ color: 'var(--muted)' }}>tiene la bomba</span></p>
              </div>
            )}
            <p className="font-mono text-[0.68rem] mt-4" style={{ color: 'var(--subtle)' }}>{bomb.passes} pases · ¡la mecha es secreta!</p>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════ Menú de modos sorpresa ═══════════ */
export function PartyMenu({ open, onOpenChange, onStart, onRules, isHost, busy }) {
  const tiles = [
    { k: 'mlt', e: '🎯', t: 'Quién es más probable', s: 'Votación grupal', cls: 'span-3' },
    { k: 'nhie', e: '🙋', t: 'Yo nunca', s: 'Confiesa en secreto', cls: 'span-3' },
    { k: 'bomb', e: '💣', t: 'Papa caliente', s: 'Pasa la bomba antes de que explote', cls: 'span-6' },
    { k: 'rules', e: '📜', t: 'Leyes', s: 'Dicta una regla', cls: 'span-3' },
    ...(isHost ? [{ k: 'chaos', e: '🌪️', t: 'Lanzar caos', s: 'Evento sorpresa', cls: 'span-3' }] : []),
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Modos sorpresa" subtitle="Interrumpe el turno con un mini-juego para toda la mesa">
      <div className="bento">
        {tiles.map(t => (
          <button
            key={t.k}
            className={`tile tile-glow ${t.cls}`}
            disabled={busy && t.k !== 'rules'}
            onClick={() => {
              feel('pop', 'medium');
              if (t.k === 'rules') onRules();
              else onStart(t.k);
              onOpenChange(false);
            }}>
            <span className="tile-emoji">{t.e}</span>
            <p className="tile-title">{t.t}</p>
            <p className="tile-sub">{t.s}</p>
          </button>
        ))}
      </div>
      {busy && <p className="text-xs mt-3 text-center" style={{ color: 'var(--muted)' }}>Hay un mini-juego en curso.</p>}
    </Sheet>
  );
}
