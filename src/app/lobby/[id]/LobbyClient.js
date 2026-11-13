'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import {
  LuArrowLeft, LuCopy, LuCheck, LuShare2, LuPlay, LuSettings2, LuMessageSquareLock, LuSend, LuCrown, LuUsers,
} from 'react-icons/lu';
import { Btn, Spinner } from '@/components/kit/Btn';
import { Sheet } from '@/components/kit/Drawer';
import { Switch } from '@/components/kit/Switch';
import { Avatar } from '@/components/kit/Avatar';
import { Marquee } from '@/components/kit/Marquee';
import { SettingsSheet } from '@/components/kit/SettingsSheet';
import { useGameStream, act } from '@/hooks/useGameStream';
import { useWakeLock } from '@/hooks/useWakeLock';
import { currentIdentity, saveSession, clearSession } from '@/lib/session';
import { feel } from '@/lib/feedback';
import { SetupIntro } from '@/components/Game/DesktopTable';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';
import { symbolLabel } from '@/data/symbols';
import confetti from 'canvas-confetti';
import { AVATARS, CONFETTI } from '@/data/party';


export default function LobbyClient({ gameId }) {
  const router = useRouter();
  const { game, push } = useGameStream(gameId, { onGone: () => router.push('/') });
  const [me, setMe] = useState({ playerId: '', isHost: false });
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [confOpen, setConfOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confDraft, setConfDraft] = useState({ type: 'truth', text: '' });
  const [sentCount, setSentCount] = useState(0);
  const [url, setUrl] = useState('');

  useWakeLock(true);

  useEffect(() => {
    /* Lectura de storage del navegador: solo existe tras hidratar, por eso va en un effect */
    /* eslint-disable react-hooks/set-state-in-effect */
    setMe(currentIdentity(gameId));
    setReady(true);
    setUrl(`${window.location.origin}/lobby/${gameId}`);
    document.body.dataset.gamePhase = 'lobby';
    document.body.dataset.gameLevel = localStorage.getItem('xtasis_secret') === 'true' ? '3' : '1';
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      delete document.body.dataset.gamePhase;
      delete document.body.dataset.gameLevel;
    };
  }, [gameId]);

  const myPlayer = useMemo(() => game?.players.find(p => p.id === me.playerId), [game, me.playerId]);
  const isJoined = !!myPlayer;
  const isHost = !!myPlayer?.isHost;

  /* Si la sala ya no me conoce (reinicio del servidor) limpio la sesión */
  useEffect(() => {
    if (ready && game && me.playerId && !myPlayer) clearSession();
  }, [ready, game, me.playerId, myPlayer]);

  /* Cuando el host arranca → todos al juego */
  useEffect(() => {
    if (game?.status === 'playing' && isJoined) {
      feel('levelup', 'heavy');
      router.push(`/game/${gameId}`);
    }
  }, [game?.status, isJoined, gameId, router]);

  const handleJoin = async e => {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setError('');
    const data = await act(gameId, { action: 'join', player: { name: name.trim(), avatar } });
    if (!data || data.error) {
      setError(data?.error || 'Error de conexión. Inténtalo de nuevo.');
      setJoining(false);
      feel('fail', 'fail');
      return;
    }
    saveSession({ gameId, playerId: data.player.id, isHost: data.player.isHost, name: data.player.name });
    setMe({ playerId: data.player.id, isHost: data.player.isHost });
    push(data.game);
    feel('success', 'success');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 }, colors: CONFETTI });
    setJoining(false);
  };

  const handleStart = async () => {
    if (!game || game.players.length < 2) return;
    setStarting(true);
    feel('pop', 'heavy');
    const data = await act(gameId, { action: 'update', updates: { status: 'playing' } });
    if (data) push(data);
    else setStarting(false);
  };

  const copy = async text => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      feel('pop', 'light');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const share = async () => {
    const data = { title: 'Xtasis', text: `Únete a mi sala de Xtasis: ${gameId}`, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    copy(url);
    toast.success('Enlace copiado');
  };

  const sendConfession = async () => {
    const text = confDraft.text.trim();
    if (!text) return;
    const res = await act(gameId, { action: 'submitConfession', playerId: me.playerId, type: confDraft.type, text });
    if (res?.error) return toast.error(res.error);
    push(res);
    setConfDraft(d => ({ ...d, text: '' }));
    setSentCount(c => c + 1);
    feel('success', 'light');
    toast.success('Carta enviada al mazo 🤫');
  };

  const setOption = (key, value) => act(gameId, { action: 'setPartyOptions', playerId: me.playerId, options: { [key]: value } }).then(push);

  if (!game || !ready) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <Spinner size={34} />
        <p className="eyebrow">Cargando sala…</p>
      </div>
    );
  }

  const playerCount = game.players.length;
  const canStart = playerCount >= 2;
  const anonCount = (game.customCards || []).length;
  const opts = game.partyOptions || {};

  if (game.status === 'playing' && !isJoined) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="panel p-6 max-w-sm text-center">
          <p className="text-4xl mb-3">🚪</p>
          <h2 className="font-display text-lg font-extrabold uppercase">Esta partida ya empezó</h2>
          <p className="text-sm mt-2 mb-5" style={{ color: 'var(--muted)' }}>
            Pide al host que cree una sala nueva para la siguiente ronda.
          </p>
          <Btn variant="acid" full onClick={() => router.push('/')}>Volver al inicio</Btn>
        </div>
      </div>
    );
  }

  return (
    <main className="lobby-page min-h-dvh flex flex-col">
      <Marquee items={['Reservado', `Mesa ${gameId}`, 'Invita a tus amigos', 'Alterna con agua']} className="tape-ink" speed={30} />

      <div className="lobby-layout flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
        <SetupIntro lobby />
        {/* ── Top ── */}
        <div className="lobby-top flex items-center justify-between">
          <Btn variant="ghost" size="sm" icon aria-label="Volver" onClick={() => router.push('/')}>
            <LuArrowLeft size={16} />
          </Btn>
          <span className="eyebrow">Sala de espera</span>
          <Btn variant="ghost" size="sm" icon aria-label="Ajustes" onClick={() => setSettingsOpen(true)}>
            <LuSettings2 size={16} />
          </Btn>
        </div>

        {/* ── Código + QR ── */}
        <motion.section
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="lobby-code panel panel-accent p-5">
          <p className="eyebrow text-center mb-2">Mesa reservada · código</p>
          <div className="room-code text-center">{gameId}</div>
          <div className="flex items-center gap-3 mt-4">
            <div className="rounded-2xl bg-white p-2 shrink-0" aria-label="Código QR para unirse">
              {url ? <QRCodeSVG value={url} size={104} bgColor="#ffffff" fgColor="#07050d" level="M" /> : <div style={{ width: 104, height: 104 }} />}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Btn variant="ghost" size="sm" full onClick={() => copy(gameId)}>
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2">
                      <LuCheck size={14} style={{ color: 'var(--acid)' }} /> Copiado
                    </motion.span>
                  ) : (
                    <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2">
                      <LuCopy size={14} /> Copiar código
                    </motion.span>
                  )}
                </AnimatePresence>
              </Btn>
              <Btn variant="cyan" size="sm" full onClick={share}>
                <LuShare2 size={14} /> Compartir enlace
              </Btn>
            </div>
          </div>
        </motion.section>

        {/* ── Unirse / Mesa ── */}
        <AnimatePresence mode="wait">
          {!isJoined ? (
            <motion.form
              key="join"
              onSubmit={handleJoin}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lobby-join panel p-5 flex flex-col gap-5">
              <div>
                <h2 className="font-display text-lg font-extrabold uppercase">Tu alter ego</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Elige tu símbolo y el nombre con el que te recordarán esta noche.</p>
              </div>

              <div>
                <p className="eyebrow mb-2">Avatar</p>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map(a => (
                    <motion.button
                      key={a}
                      type="button"
                      whileTap={{ scale: 0.82, rotate: -8 }}
                      aria-pressed={avatar === a}
                      aria-label={`Avatar ${symbolLabel(a)}`}
                      className="avatar-pick"
                      onClick={() => { feel('tick', 'tick'); setAvatar(a); }}>
                      <PlayerSymbol symbol={a} />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2">Tu nombre</p>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="Ej. Diablo24"
                  className="input"
                  autoComplete="off"
                />
                {error && (
                  <p className="text-sm font-bold mt-2" style={{ color: 'var(--pink)' }} role="alert">{error}</p>
                )}
              </div>

              <Btn type="submit" variant="acid" size="xl" full disabled={joining || !name.trim()}>
                {joining ? <Spinner size={22} /> : <><PlayerSymbol symbol={avatar} size={24} /> Tomar asiento</>}
              </Btn>
            </motion.form>
          ) : (
            <motion.div key="room" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="lobby-room flex flex-col gap-4">
              {/* Mesa */}
              <section className="panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-sm font-extrabold uppercase flex items-center gap-2">
                    <LuUsers size={15} style={{ color: 'var(--accent)' }} /> Invitados
                  </h2>
                  <span className="chip chip-on">{playerCount}/8</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <AnimatePresence initial={false}>
                    {game.players.map(p => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                        className="panel-2 flex items-center gap-2.5"
                        style={{
                          padding: '0.55rem 0.7rem',
                          borderColor: p.id === me.playerId ? 'var(--accent)' : undefined,
                        }}>
                        <Avatar player={p} size="md" active={p.id === me.playerId} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{p.name}</p>
                          <p className="text-[0.62rem] font-extrabold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                            {p.isHost && <><LuCrown size={10} style={{ color: 'var(--acid)' }} /> Host</>}
                            {p.id === me.playerId && <span>{p.isHost ? ' · Tú' : 'Tú'}</span>}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {playerCount < 2 &&
                    Array.from({ length: 2 - playerCount }).map((_, i) => (
                      <div key={`e${i}`} className="panel-2 flex items-center gap-2.5" style={{ padding: '0.55rem 0.7rem', borderStyle: 'dashed', opacity: 0.5 }}>
                        <div className="skeleton avatar avatar-md" />
                        <div className="skeleton rounded" style={{ width: '4rem', height: '0.7rem' }} />
                      </div>
                    ))}
                </div>
                {playerCount < 2 && (
                  <p className="text-center text-xs mt-3 font-semibold" style={{ color: 'var(--muted)' }}>
                    Comparte el código o el QR — mínimo 2 jugadores
                  </p>
                )}
              </section>

              {/* Confesionario */}
              <button className="tile tile-glow flex items-center gap-3" onClick={() => setConfOpen(true)}>
                <LuMessageSquareLock size={24} style={{ color: 'var(--pink)' }} />
                <div className="flex-1">
                  <p className="tile-title">Confesionario anónimo</p>
                  <p className="tile-sub">Escribe verdades y retos que nadie sabrá de quién son</p>
                </div>
                <span className="chip chip-on">{anonCount}</span>
              </button>

              {/* Opciones host */}
              {isHost && (
                <section className="flex flex-col gap-2">
                  <p className="eyebrow">Opciones del host</p>
                  <Switch icon="🌪️" label="Eventos de caos" hint="Un evento sorpresa cada 7 turnos" checked={opts.chaos !== false} onChange={v => setOption('chaos', v)} />
                  <Switch icon="💧" label="Pausas de agua" hint="Recordatorio de hidratación cada 11 turnos" checked={opts.water !== false} onChange={v => setOption('water', v)} />
                </section>
              )}

              {/* Start */}
              {isHost ? (
                <Btn variant="acid" size="xl" full onClick={handleStart} disabled={!canStart || starting}>
                  {starting ? <Spinner size={22} /> : canStart ? <><LuPlay size={20} /> Comenzar la noche</> : 'Faltan jugadores (mín. 2)'}
                </Btn>
              ) : (
                <div className="panel p-4 text-center">
                  <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--muted)' }}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'glow-pulse 1.4s ease-in-out infinite' }} />
                    Esperando a que el host empiece…
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Confesionario ── */}
      <Sheet open={confOpen} onOpenChange={setConfOpen} title="Confesionario" subtitle="Tu carta entra al mazo sin firma. Solo tú sabrás que fuiste tú 🤫">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {[['truth', '💭 Verdad'], ['dare', '🔥 Reto']].map(([t, label]) => (
              <button key={t} type="button" className={`chip ${confDraft.type === t ? 'chip-on' : ''}`} onClick={() => setConfDraft(d => ({ ...d, type: t }))}>
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={confDraft.text}
            onChange={e => setConfDraft(d => ({ ...d, text: e.target.value }))}
            placeholder={confDraft.type === 'truth' ? '¿Alguna vez has…?' : 'Imita a la persona de tu derecha durante 20 segundos…'}
            className="input"
            rows={3}
            maxLength={160}
            style={{ resize: 'none' }}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs" style={{ color: 'var(--subtle)' }}>{confDraft.text.length}/160</span>
            <Btn variant="pink" size="sm" onClick={sendConfession} disabled={!confDraft.text.trim()}>
              <LuSend size={14} /> Enviar al mazo
            </Btn>
          </div>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            En el mazo hay {anonCount} carta{anonCount !== 1 ? 's' : ''} anónima{anonCount !== 1 ? 's' : ''}
            {sentCount > 0 && ` · tú aportaste ${sentCount}`}.
          </p>
        </div>
      </Sheet>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  );
}
