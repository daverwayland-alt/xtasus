'use client';

/* Los efectos de este componente sincronizan con temporizadores, el stream SSE y el storage del navegador;
   resetear estado local al arrancar/parar un temporizador es intencional. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  LuArrowLeft, LuZap, LuMartini, LuSparkles, LuScrollText, LuBeer, LuEyeOff, LuCheck, LuSkipForward, LuChevronRight, LuSettings2,
} from 'react-icons/lu';

import { getRandomCard } from '@/data/cards';
import { LEVEL_THEME } from '@/data/party';
import { useGameStream, act } from '@/hooks/useGameStream';
import { useWakeLock } from '@/hooks/useWakeLock';
import { currentIdentity, clearSession } from '@/lib/session';
import { feel, speak, stopSpeaking } from '@/lib/feedback';
import { getAlivePlayers } from '@/lib/lives';

import { Btn, Spinner } from '@/components/kit/Btn';
import { Pips } from '@/components/kit/Avatar';
import { SettingsSheet } from '@/components/kit/SettingsSheet';
import { TurnWheel } from '@/components/Game/TurnWheel';
import { CardStage } from '@/components/Game/CardStage';
import { PlayerDock } from '@/components/Game/PlayerDock';
import { ReactionBar, ReactionRain, useReactionRain } from '@/components/Game/Reactions';
import {
  VoteOverlay, DuelOverlay, ReturnOverlay, LevelUpOverlay, ChaosOverlay, WaterOverlay, TargetPicker, ToolToast,
} from '@/components/Game/Overlays';
import { MltOverlay, NhieOverlay, BombOverlay, PartyMenu } from '@/components/Game/PartyModes';
import { ToolsSheet, RulesSheet, MissionSheet, DrinksSheet } from '@/components/Game/Sheets';
import { Recap } from '@/components/Game/Recap';
import { TableIdentity, DesktopTable } from '@/components/Game/DesktopTable';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

const NONE_LIST = [];
const NONE_MAP = {};
const LIGHTNING_SECS = 30;
const GOLDEN_CHANCE = 0.07;

export default function GameClient({ gameId }) {
  const router = useRouter();
  const { game, push } = useGameStream(gameId, { onGone: () => { clearSession(); router.push('/'); } });
  const [me, setMe] = useState({ playerId: '', isHost: false });
  const [secretMode, setSecretMode] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [usingTool, setUsingTool] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [toolToast, setToolToast] = useState(null);
  const [toolTargeting, setToolTargeting] = useState(null);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const [lightningTimer, setLightningTimer] = useState(LIGHTNING_SECS);
  const [shake, setShake] = useState(false);

  const [sheet, setSheet] = useState(null); // 'tools' | 'party' | 'rules' | 'mission' | 'drinks' | 'settings'

  const prevLevelRef = useRef(null);
  const prevTurnRef = useRef(null);
  const prevCardRef = useRef(null);
  const lastToolTsRef = useRef(null);
  const toolsInitRef = useRef(false);
  const autoVoteRef = useRef(null);
  const lightningHandledRef = useRef(false);

  useWakeLock(true);

  /* ── Identidad ── */
  useEffect(() => {
    setMe(currentIdentity(gameId));
    setSecretMode(localStorage.getItem('xtasis_secret') === 'true');
    return () => stopSpeaking();
  }, [gameId]);

  const myId = me.playerId;
  const players = game?.players ?? NONE_LIST;
  const lives = game?.playerLives ?? NONE_MAP;
  const alive = useMemo(() => getAlivePlayers(players, lives), [players, lives]);
  const myPlayer = players.find(p => p.id === myId);
  const isHost = !!myPlayer?.isHost;
  const isAlive = (lives[myId] ?? 3) > 0;
  const level = game?.currentLevel ?? 1;
  const theme = LEVEL_THEME[level] ?? LEVEL_THEME[1];

  const { floaters, spawn } = useReactionRain(game?.reactions, myId);

  /* ── Helper de acciones ── */
  const call = useCallback(
    async body => {
      const res = await act(gameId, { playerId: myId, ...body });
      if (res?.error) toast.error(res.error);
      else if (res?.id) push(res);
      return res;
    },
    [gameId, myId, push],
  );

  const doShake = useCallback(() => {
    setShake(true);
    feel('fail', 'fail');
    setTimeout(() => setShake(false), 500);
  }, []);

  /* ── Redirecciones de estado ── */
  useEffect(() => {
    if (!game) return;
    if (game.status === 'lobby') router.push(`/lobby/${gameId}`);
  }, [game?.status, gameId, router]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Efectos al llegar un estado nuevo (nivel, sustancias, caída de vidas…) ── */
  useEffect(() => {
    if (!game) return;

    if (prevLevelRef.current !== null && game.currentLevel !== prevLevelRef.current) {
      const t = LEVEL_THEME[game.currentLevel];
      setLevelUpData({ level: game.currentLevel, ...t });
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 }, colors: [t.color, '#fff4d6', '#ff2d6f'] });
      setTimeout(() => setLevelUpData(null), 2800);
    }
    prevLevelRef.current = game.currentLevel;

    const lte = game.lastToolEffect;
    if (lte && lte.timestamp !== lastToolTsRef.current) {
      if (lastToolTsRef.current !== null) {
        setToolToast({ text: lte.toastText, emoji: lte.toolEmoji });
        setTimeout(() => setToolToast(null), 4000);
        feel('pop', 'medium');
        if (['curse_life', 'double_penalty'].includes(lte.effect)) doShake();
      }
      lastToolTsRef.current = lte.timestamp;
    }

    /* Host reparte sustancias al arrancar */
    if (!toolsInitRef.current && isHost && game.status === 'playing' && Object.keys(game.playerTools || {}).length === 0 && game.players.length > 0) {
      toolsInitRef.current = true;
      act(gameId, { action: 'initTools' });
    }
    if (Object.keys(game.playerTools || {}).length > 0) toolsInitRef.current = true;
  }, [game]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Si quien cayó no responde a tiempo, el anfitrión cierra la oferta: se queda fuera. */
  const returnOffer = game?.revanchaState;
  useEffect(() => {
    if (!returnOffer || !isHost) return undefined;
    const wait = Math.max(0, (returnOffer.expiresAt || 0) - Date.now()) + 1500;
    const t = setTimeout(() => act(gameId, { action: 'returnChoice', accept: false }), wait);
    return () => clearTimeout(t);
  }, [returnOffer, isHost, gameId]);

  /* Si pierdo una vida → sacudida */
  const myLives = lives[myId] ?? 3;
  const prevLivesRef = useRef(null);
  useEffect(() => {
    if (!myId || !game) return;
    if (prevLivesRef.current !== null && myLives < prevLivesRef.current) doShake();
    prevLivesRef.current = myLives;
  }, [myLives, myId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Narrador */
  useEffect(() => {
    const c = game?.currentCard;
    if (c && c.id !== prevCardRef.current) speak(c.text);
    prevCardRef.current = c?.id ?? null;
  }, [game?.currentCard?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Mundo visual según nivel/fase */
  useEffect(() => {
    document.body.dataset.gameLevel = String(secretMode ? 3 : level);
    document.body.dataset.gamePhase = game?.currentCard ? 'focus' : 'play';
    document.body.classList.toggle('secret-active', secretMode);
    return () => {
      delete document.body.dataset.gameLevel;
      delete document.body.dataset.gamePhase;
      document.body.classList.remove('secret-active');
    };
  }, [level, secretMode, game?.currentCard]);

  /* ── Votación: cuenta atrás + auto-voto "sí" al expirar ── */
  useEffect(() => {
    if (!game?.voteState) {
      setVoteTimeLeft(0);
      return;
    }
    const tick = () => setVoteTimeLeft(Math.max(0, Math.ceil((game.voteState.expiresAt - Date.now()) / 1000)));
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [game?.voteState]);

  useEffect(() => {
    const vs = game?.voteState;
    if (!vs) {
      autoVoteRef.current = null;
      return;
    }
    if (voteTimeLeft > 0 || vs.votes?.[myId] || myId === vs.targetId) return;
    const key = `${vs.targetId}-${vs.startedAt}`;
    if (autoVoteRef.current === key) return;
    autoVoteRef.current = key;
    act(gameId, { action: 'vote', playerId: myId, vote: 'yes' });
  }, [game?.voteState, voteTimeLeft, gameId, myId]);

  const lightningActive = !!game?.lightningMode && !!game?.currentCard;

  /* ══════ ACCIONES ══════ */
  const handleDrawCard = useCallback(
    async type => {
      if (!game || isDrawing) return;
      const myTruth = game.playerTruthData?.[myId] || { streak: 0, lockedTurns: 0 };
      if (type === 'truth' && myTruth.lockedTurns > 0) return;
      setIsDrawing(true);
      feel('pop', 'medium');

      const names = game.players.map(p => p.name);
      const currentName = game.players.find(p => p.id === game.currentTurnPlayerId)?.name || names[0];
      const playedIds = game.playedCards || [];
      const lvl = secretMode ? 3 : game.currentLevel;
      const updates = {};

      const goldenLeft = game.goldenCardsLeft ?? 2;
      const hasGolden = !!game.playerGoldenCards?.[myId];
      let card;
      if (goldenLeft > 0 && !hasGolden && Math.random() < GOLDEN_CHANCE) {
        card = {
          id: `golden_${Date.now()}`,
          type: 'golden',
          level: lvl,
          text: '✨ ¡Carta dorada! Úsala ahora para cancelar un reto sin perder vida… o guárdala para pedir un deseo al final.',
        };
        updates.goldenCardsLeft = goldenLeft - 1;
        updates.playerGoldenCards = { ...(game.playerGoldenCards || {}), [myId]: { status: 'held' } };
      } else {
        card = getRandomCard(lvl, type, names, currentName, playedIds, game.customCards || []);
      }

      updates.currentCard = card;
      updates.playedCards = [...playedIds, card.id];

      const truthData = game.playerTruthData || {};
      if (card.type === 'truth') {
        const s = (myTruth.streak || 0) + 1;
        updates.playerTruthData = { ...truthData, [myId]: s >= 2 ? { streak: 0, lockedTurns: 2 } : { streak: s, lockedTurns: 0 } };
      } else if ((card.type === 'dare' || card.type === 'golden') && myTruth.streak > 0) {
        updates.playerTruthData = { ...truthData, [myId]: { streak: 0, lockedTurns: myTruth.lockedTurns } };
      }

      const perPlayer = { ...(game.stats?.perPlayer || {}) };
      const mine = { truths: 0, dares: 0, ...(perPlayer[myId] || {}) };
      if (card.type === 'truth') mine.truths += 1;
      else if (card.type === 'dare') mine.dares += 1;
      perPlayer[myId] = mine;
      updates.stats = { ...(game.stats || {}), perPlayer };

      await call({ action: 'update', updates });
      setIsDrawing(false);
    },
    [game, isDrawing, myId, secretMode, call],
  );

  const handleNextTurn = useCallback(() => call({ action: 'nextTurn' }), [call]);

  const turnPlayerId = game?.currentTurnPlayerId;
  const handleSkip = useCallback(async () => {
    if (!turnPlayerId || skipping) return;
    setSkipping(true);
    await call({ action: 'skipCard', playerId: turnPlayerId });
    setSkipping(false);
  }, [turnPlayerId, skipping, call]);

  const handleComplete = useCallback(() => {
    feel('success', 'success');
    return call({ action: 'completeCard' });
  }, [call]);

  const handleGolden = useCallback(
    async useNow => {
      if (game?.currentCard?.type !== 'golden') return;
      const updates = { currentCard: null };
      if (useNow) updates.playerGoldenCards = { ...(game.playerGoldenCards || {}), [myId]: { status: 'used' } };
      await call({ action: 'update', updates });
      await handleNextTurn();
    },
    [game, myId, call, handleNextTurn],
  );

  const handleChangeLevel = lvl => isHost && call({ action: 'update', updates: { currentLevel: lvl } });
  const handleLightning = () => isHost && call({ action: 'update', updates: { lightningMode: !game?.lightningMode } });

  const handleUseTool = useCallback(
    async (tool, targetId = null) => {
      if (usingTool) return;
      setUsingTool(true);
      setToolTargeting(null);
      setSheet(null);
      await call({ action: 'useTool', tool, targetId });
      setUsingTool(false);
    },
    [usingTool, call],
  );

  const anyFallen = players.some(p => (lives[p.id] ?? 1) <= 0);
  const startToolUse = tool => {
    if (tool.effect === 'revive' && !anyFallen) {
      setToolToast({ text: 'Nadie ha caído todavía — guarda esta carta', emoji: tool.emoji });
      setTimeout(() => setToolToast(null), 3000);
      return;
    }
    return tool.requiresTarget ? (setSheet(null), setToolTargeting(tool)) : handleUseTool(tool);
  };

  const handleReact = emoji => {
    spawn(emoji);
    act(gameId, { action: 'react', playerId: myId, emoji });
  };

  const startParty = kind => {
    if (kind === 'mlt') call({ action: 'startMlt' });
    if (kind === 'nhie') call({ action: 'startNhie' });
    if (kind === 'bomb') call({ action: 'startBomb', playerId: myId });
    if (kind === 'chaos') call({ action: 'triggerChaos' });
  };

  const bombCheck = useCallback(() => act(gameId, { action: 'bombCheck' }).then(r => r?.id && push(r)), [gameId, push]);

  /* ── Modo Relámpago (temporizador + auto-"no me atrevo" al expirar) ── */
  useEffect(() => {
    if (!lightningActive) {
      setLightningTimer(LIGHTNING_SECS);
      lightningHandledRef.current = false;
      return;
    }
    setLightningTimer(LIGHTNING_SECS);
    lightningHandledRef.current = false;
    const iv = setInterval(() => setLightningTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [lightningActive, game?.currentCard?.id]);

  useEffect(() => {
    if (!lightningActive || lightningTimer > 0 || lightningHandledRef.current) return;
    lightningHandledRef.current = true;
    if (game?.currentTurnPlayerId === myId) handleSkip();
  }, [lightningTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lightningActive && lightningTimer > 0 && lightningTimer <= 5) feel('tick', 'tick');
  }, [lightningTimer, lightningActive]);

  /* ══════ RENDER ══════ */
  if (!game || !myId) {
    if (game && !myId) {
      return (
        <div className="min-h-dvh flex items-center justify-center p-6">
          <div className="panel p-6 max-w-sm text-center">
            <p className="text-4xl mb-3">🔌</p>
            <h2 className="font-display text-lg font-extrabold uppercase">No estás en esta partida</h2>
            <p className="text-sm mt-2 mb-5" style={{ color: 'var(--muted)' }}>Entra desde el lobby con el código de sala.</p>
            <Btn variant="acid" full onClick={() => router.push('/')}>Ir al inicio</Btn>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <Spinner size={36} />
        <p className="eyebrow">Sincronizando mesa…</p>
      </div>
    );
  }

  if (game.winnerId) {
    return (
      <Recap
        winnerId={game.winnerId}
        players={players}
        stats={game.stats}
        missions={game.missions}
        drinks={game.drinks}
        gameId={gameId}
        onClose={() => { clearSession(); router.push('/'); }}
      />
    );
  }

  if (!game.currentTurnPlayerId) {
    return (
      <main className="table-ready min-h-dvh flex flex-col items-center justify-center gap-7 px-5 text-center">
        <motion.div animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3.5 }} className="text-7xl">
          <PlayerSymbol symbol={theme.emoji} size={88} />
        </motion.div>
        <div>
          <h2 className="font-display text-3xl font-black uppercase leading-none">{isHost ? 'Todo listo' : 'Preparados…'}</h2>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--muted)' }}>{theme.label} · {theme.tag}</p>
        </div>
        {isHost ? (
          <Btn variant="acid" size="xl" onClick={handleNextTurn}>🎡 Sortear primer turno</Btn>
        ) : (
          <div className="panel p-4 inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--muted)' }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'glow-pulse 1.4s ease-in-out infinite' }} />
            El host está preparando la ruleta…
          </div>
        )}
      </main>
    );
  }

  const activePlayer = players.find(p => p.id === game.currentTurnPlayerId) ?? players[0];
  const isMyTurn = activePlayer?.id === myId && isAlive;
  const canAct = isMyTurn || isHost;
  const myTruth = game.playerTruthData?.[myId] || { streak: 0, lockedTurns: 0 };
  const truthLocked = myTruth.lockedTurns > 0;
  const myTools = game.playerTools?.[myId] || [];
  const card = game.currentCard;
  const isGolden = card?.type === 'golden';
  const miniGame = !!(game.mlt || game.nhie || game.bomb);
  const myMission = game.missions?.[myId];
  const rules = game.rules || [];
  const drinks = game.drinks || {};

  const modal = !!(game.voteState || game.duelState || game.revanchaState || miniGame || game.chaos || game.waterBreak);

  return (
    <main className={`table-game min-h-dvh flex flex-col ${shake ? 'shake' : ''}`}>
      <TableIdentity />
      {/* ═════ HUD ═════ */}
      <header className="hud">
        <Btn variant="ghost" size="sm" icon aria-label="Salir" onClick={() => router.push('/')}>
          <LuArrowLeft size={16} />
        </Btn>

        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,.4)', border: '1px solid var(--line)' }} role="group" aria-label="Nivel">
          {[1, 2, 3].map(n => {
            const t = LEVEL_THEME[n];
            const active = level === n;
            return (
              <button
                key={n}
                type="button"
                disabled={!isHost}
                aria-pressed={active}
                aria-label={`Nivel ${n}: ${t.label}`}
                onClick={() => { feel('click', 'light'); handleChangeLevel(n); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{
                  background: active ? t.color : 'transparent',
                  color: active ? '#1a0a00' : 'var(--muted)',
                  boxShadow: active ? `0 0 16px ${t.color}88` : 'none',
                  transition: 'all .2s var(--ease-snap)',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                  cursor: isHost ? 'pointer' : 'default',
                  border: 0,
                }}>
                {active ? <PlayerSymbol symbol={t.emoji} size={22} /> : n}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 text-center">
          <p className="font-display text-[0.62rem] font-extrabold uppercase truncate" style={{ color: 'var(--accent)' }}>
            {theme.label}{secretMode && ' · oscuro'}
          </p>
          <p className="font-mono text-[0.58rem]" style={{ color: 'var(--subtle)' }}>turno {game.turnCount ?? 0} · {gameId}</p>
        </div>

        <Pips lives={myLives} />
        <Btn variant="ghost" size="sm" icon aria-label="Ajustes" onClick={() => setSheet('settings')}>
          <LuSettings2 size={16} />
        </Btn>
      </header>

      {/* ═════ Barra de acciones ═════ */}
      <div className="table-tools px-3 pt-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <ActionChip icon={<LuMartini size={14} />} label="Cócteles" count={myTools.length} onClick={() => setSheet('tools')} />
          <ActionChip icon={<LuSparkles size={14} />} label="Modos" onClick={() => setSheet('party')} hot={!miniGame} />
          <ActionChip icon={<LuScrollText size={14} />} label="Leyes" count={rules.length} onClick={() => setSheet('rules')} />
          <ActionChip icon={<LuEyeOff size={14} />} label="Misión" dot={myMission && !myMission.done} onClick={() => setSheet('mission')} />
          <ActionChip icon={<LuBeer size={14} />} label="Tragos" count={drinks[myId] || 0} onClick={() => setSheet('drinks')} />
          {isHost && (
            <ActionChip icon={<LuZap size={14} />} label="Relámpago" on={game.lightningMode} onClick={handleLightning} />
          )}
        </div>
        <DesktopTable player={activePlayer} round={game.turnCount ?? 0} room={gameId} players={players.length} onDraw={handleDrawCard} canDraw={isMyTurn && !card && !spinning && !modal && !sheet && !isDrawing} truthLocked={truthLocked} />
      </div>

      {/* ═════ Zona central ═════ */}
      <section className="table-stage flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4 justify-center">
        {/* Leyes vigentes */}
        {rules.length > 0 && (
          <button type="button" onClick={() => setSheet('rules')} className="banner text-left" style={{ cursor: 'pointer', color: 'var(--paper)' }}>
            <span className="text-lg">📜</span>
            <span className="flex-1 min-w-0 truncate text-[0.78rem]">
              <b style={{ color: 'var(--accent)' }}>Ley vigente:</b> {rules[rules.length - 1].text}
            </span>
            {rules.length > 1 && <span className="chip chip-on">+{rules.length - 1}</span>}
          </button>
        )}

        {game.lightningMode && (
          <div className="banner" style={{ borderColor: 'var(--gold)', background: 'rgba(231,185,90,.1)' }}>
            <LuZap size={16} style={{ color: 'var(--gold)' }} />
            <span>Modo Relámpago — {card ? `${lightningTimer}s para cumplir` : 'responde antes de que se acabe el tiempo'}</span>
          </div>
        )}

        {/* Ruleta (siempre montada para que gire al cambiar el turno) */}
        <div style={{ display: card ? 'none' : 'block' }}>
          <div className="text-center mb-4">
            <p className="eyebrow mb-2">{spinning ? 'Sorteando turno…' : 'Le toca a'}</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={spinning ? 'spin' : activePlayer?.id}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                className="font-display font-black uppercase leading-none whitespace-nowrap"
                style={{ fontSize: 'clamp(1.8rem, 9vw, 2.7rem)', textShadow: '0 0 34px var(--accent-glow)' }}>
                {spinning ? '· · ·' : isMyTurn ? '¡Tú!' : activePlayer?.name}
              </motion.h2>
            </AnimatePresence>
          </div>

          <TurnWheel
            players={players}
            lives={lives}
            targetId={game.currentTurnPlayerId}
            initialSpin={(game.turnCount ?? 0) === 0}
            active={spinning}
            onSpinChange={setSpinning}
          />

          {!spinning && isMyTurn && !modal && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-7 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <Btn variant="cyan" size="xl" full onClick={() => handleDrawCard('truth')} disabled={isDrawing || truthLocked}>💭 Verdad</Btn>
                  {truthLocked && <span className="text-[0.65rem] font-bold" style={{ color: 'var(--muted)' }}>🔒 bloqueada {myTruth.lockedTurns} turno{myTruth.lockedTurns !== 1 ? 's' : ''}</span>}
                </div>
                <Btn variant="pink" size="xl" full onClick={() => handleDrawCard('dare')} disabled={isDrawing}>🔥 Reto</Btn>
              </div>
              <Btn variant="acid" full onClick={() => handleDrawCard('random')} disabled={isDrawing}>
                {isDrawing ? <Spinner /> : '🎲 Sorpréndeme'}
              </Btn>
            </motion.div>
          )}

          {!spinning && !isMyTurn && (
            <p className="text-center text-sm font-semibold mt-6" style={{ color: 'var(--muted)' }}>
              {isAlive ? <>Esperando a <b style={{ color: 'var(--paper)' }}>{activePlayer?.name}</b>…</> : '👻 Estás eliminado: mira y reacciona'}
            </p>
          )}
        </div>

        {/* Carta */}
        <AnimatePresence mode="wait">
          {card && (
            <motion.div key={card.id} className="flex flex-col gap-4" exit={{ opacity: 0 }}>
              {game.lightningMode && (
                <div className="timer-bar" aria-hidden="true">
                  <i style={{ width: `${(lightningTimer / LIGHTNING_SECS) * 100}%`, background: lightningTimer <= 10 ? 'var(--pink)' : 'var(--gold)' }} />
                </div>
              )}

              <CardStage card={card} lives={lives[activePlayer?.id] ?? 3} level={level} />
              {!isGolden && <ReactionBar onReact={handleReact} />}

              {isGolden && isMyTurn && (
                <div className="grid grid-cols-2 gap-3">
                  <Btn variant="acid" onClick={() => handleGolden(true)}>✨ Usar ya</Btn>
                  <Btn variant="ghost" onClick={() => handleGolden(false)}>🌟 Guardar</Btn>
                </div>
              )}

              {!isGolden && canAct && !game.voteState && (
                <div className="flex gap-3">
                  {isMyTurn && (
                    <Btn variant="outline" className="btn-pink flex-1" onClick={handleSkip} disabled={skipping} title="Rendirte cuesta una vida">
                      {skipping ? <Spinner /> : <><LuSkipForward size={15} /> No me atrevo</>}
                    </Btn>
                  )}
                  <Btn variant="acid" className={isMyTurn ? 'flex-1' : 'w-full'} onClick={isMyTurn ? handleComplete : handleNextTurn}>
                    {isMyTurn ? <><LuCheck size={16} /> Cumplí</> : <>Siguiente <LuChevronRight size={16} /></>}
                  </Btn>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <PlayerDock players={players} lives={lives} activeId={game.currentTurnPlayerId} myId={myId} golden={game.playerGoldenCards} drinks={drinks} />

      {/* ═════ Capas ═════ */}
      <ReactionRain floaters={floaters} />

      <AnimatePresence>
        {toolToast && <ToolToast key="toast" toast={toolToast} />}
        {levelUpData && <LevelUpOverlay key="lvl" data={levelUpData} />}
      </AnimatePresence>

      <AnimatePresence>
        {toolTargeting && (
          <TargetPicker key="target" tool={toolTargeting} players={players} myId={myId} lives={lives} onPick={id => handleUseTool(toolTargeting, id)} onCancel={() => setToolTargeting(null)} />
        )}
        {game.voteState && (
          <VoteOverlay key="vote" voteState={game.voteState} players={players} myId={myId} timeLeft={voteTimeLeft}
            onVote={vote => call({ action: 'vote', vote })} />
        )}
        {game.duelState && (
          <DuelOverlay key="duel" duelState={game.duelState} players={players} myId={myId}
            onVote={winnerId => call({ action: 'duelVote', winnerId })} />
        )}
        {game.revanchaState && (
          <ReturnOverlay key="rev" state={game.revanchaState} players={players} myId={myId} canDecide={isHost}
            onChoice={accept => call({ action: 'returnChoice', accept })} />
        )}
        {game.mlt && (
          <MltOverlay key="mlt" mlt={game.mlt} players={players} lives={lives} myId={myId}
            onVote={targetId => call({ action: 'mltVote', targetId })} onClose={() => call({ action: 'partyClose' })} />
        )}
        {game.nhie && (
          <NhieOverlay key="nhie" nhie={game.nhie} players={players} lives={lives} myId={myId}
            onAnswer={did => call({ action: 'nhieAnswer', did })} onClose={() => call({ action: 'partyClose' })} />
        )}
        {game.bomb && (
          <BombOverlay key="bomb" bomb={game.bomb} players={players} lives={lives} myId={myId}
            onPass={targetId => call({ action: 'bombPass', targetId })} onCheck={bombCheck} onClose={() => call({ action: 'partyClose' })} />
        )}
        {game.chaos && !miniGame && (
          <ChaosOverlay key="chaos" chaos={game.chaos} onDismiss={() => call({ action: 'chaosDismiss' })} />
        )}
        {game.waterBreak && !miniGame && !game.chaos && (
          <WaterOverlay key="water" water={game.waterBreak} myId={myId} alivePlayers={alive} onAck={() => call({ action: 'waterAck' })} />
        )}
      </AnimatePresence>

      {/* ═════ Sheets ═════ */}
      <ToolsSheet open={sheet === 'tools'} onOpenChange={o => !o && setSheet(null)} tools={myTools} streak={game.playerDareStreak?.[myId] || 0} anyFallen={anyFallen} busy={usingTool} onUse={startToolUse} />
      <PartyMenu open={sheet === 'party'} onOpenChange={o => !o && setSheet(null)} isHost={isHost} busy={miniGame}
        onStart={startParty} onRules={() => setTimeout(() => setSheet('rules'), 250)} />
      <RulesSheet open={sheet === 'rules'} onOpenChange={o => !o && setSheet(null)} rules={rules} players={players} isHost={isHost}
        onAdd={text => call({ action: 'addRule', text })} onRemove={ruleId => call({ action: 'removeRule', ruleId })} />
      <MissionSheet open={sheet === 'mission'} onOpenChange={o => !o && setSheet(null)} mission={myMission}
        onDone={() => { feel('success', 'success'); call({ action: 'missionDone' }); }} />
      <DrinksSheet open={sheet === 'drinks'} onOpenChange={o => !o && setSheet(null)} players={players} drinks={drinks}
        onDrink={(targetId, delta) => call({ action: 'drink', targetId, delta })} />
      <SettingsSheet open={sheet === 'settings'} onOpenChange={o => !o && setSheet(null)} />
    </main>
  );
}

function ActionChip({ icon, label, count, dot, on, hot, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={() => { feel('click', 'light'); onClick(); }}
      className={`chip shrink-0 ${on ? 'chip-on' : ''}`}
      style={{ cursor: 'pointer', padding: '0.5rem 0.85rem', borderColor: hot ? 'var(--accent)' : undefined, position: 'relative' }}>
      {icon} {label}
      {count > 0 && <span className="rounded-full px-1.5 text-[0.6rem] font-black" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{count}</span>}
      {dot && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--pink)', boxShadow: '0 0 10px var(--pink)' }} />}
    </motion.button>
  );
}
