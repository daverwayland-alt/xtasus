'use client';

/* Los efectos sincronizan con temporizadores (relámpago, votación) y el storage del navegador;
   resetear estado local al arrancar/parar un temporizador es intencional. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  LuArrowLeft, LuMartini, LuSparkles, LuScrollText, LuBeer, LuZap, LuCheck, LuSkipForward, LuChevronRight, LuPlus, LuX, LuHeart,
} from 'react-icons/lu';

import { getRandomCard } from '@/data/cards';
import { getRandomTools, drawTool, buildToastText, TOOLS_AT_START, DARE_STREAK_GOAL } from '@/data/tools';
import { awardDareStreak, resetDareStreak } from '@/lib/rewards';
import { LEVEL_THEME, CHAOS_EVENTS, WATER_LINES, MLT_PROMPTS, NHIE_PROMPTS, BOMB_CATEGORIES, AVATARS } from '@/data/party';
import { MAX_LIVES, VOTE_DURATION_MS, DUEL_INTERVAL_TURNS } from '@/lib/gameConstants';
import { initPlayerLives, loseLife, gainLife, getAlivePlayers, getWinnerId } from '@/lib/lives';
import { bump } from '@/lib/party';
import { feel, speak, stopSpeaking } from '@/lib/feedback';
import { useWakeLock } from '@/hooks/useWakeLock';

import { Btn, Spinner } from '@/components/kit/Btn';
import { Avatar, Pips } from '@/components/kit/Avatar';
import { Marquee } from '@/components/kit/Marquee';
import { SettingsSheet } from '@/components/kit/SettingsSheet';
import { TurnWheel } from '@/components/Game/TurnWheel';
import { CardStage } from '@/components/Game/CardStage';
import { PlayerDock } from '@/components/Game/PlayerDock';
import {
  VoteOverlay, DuelOverlay, ReturnOverlay, LevelUpOverlay, ChaosOverlay, WaterOverlay, TargetPicker, ToolToast,
} from '@/components/Game/Overlays';
import { ToolsSheet, RulesSheet, DrinksSheet } from '@/components/Game/Sheets';
import { Sheet } from '@/components/kit/Drawer';
import { Recap } from '@/components/Game/Recap';
import { TableIdentity, DesktopTable, SetupIntro } from '@/components/Game/DesktopTable';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

const LIGHTNING_SECS = 30;
const GOLDEN_CHANCE = 0.15;

const NO_PLAYER = { id: '', name: '', avatar: '' };
const pick = a => a[Math.floor(Math.random() * a.length)];
let pidSeq = 1;
const makePlayer = (name, avatar) => ({ id: `p${pidSeq++}`, name: name.trim(), avatar });

function drawOfflineCard(level, type, players, current, playedIds) {
  return getRandomCard(level, type, players.map(p => p.name), current.name, playedIds);
}

export default function OfflinePage() {
  const router = useRouter();
  useWakeLock(true);

  const [phase, setPhase] = useState('setup');
  const [slots, setSlots] = useState([
    { id: 's1', name: '', avatar: AVATARS[0] },
    { id: 's2', name: '', avatar: AVATARS[1] },
  ]);
  const [startLevel, setStartLevel] = useState(1);
  const [secretMode, setSecretMode] = useState(false);

  /* ── Estado de la partida ── */
  const [players, setPlayers] = useState([]);
  const [level, setLevel] = useState(1);
  const [turnIdx, setTurnIdx] = useState(0);
  const [card, setCard] = useState(null);
  const [playedIds, setPlayedIds] = useState([]);
  const [lives, setLives] = useState({});
  const [revanchaUsed, setRevanchaUsed] = useState({});
  const [turnCount, setTurnCount] = useState(0);
  const [voteState, setVoteState] = useState(null);
  const [duelState, setDuelState] = useState(null);
  const [revanchaState, setRevanchaState] = useState(null);
  const [winnerId, setWinnerId] = useState(null);
  const [effects, setEffects] = useState({});
  const [stats, setStats] = useState({ cardsPlayed: 0, skips: 0, votesFailed: 0, perPlayer: {} });
  const [truthData, setTruthData] = useState({});
  const [tools, setTools] = useState({});
  const [dareStreak, setDareStreak] = useState({});
  const [goldenLeft, setGoldenLeft] = useState(2);
  const [golden, setGolden] = useState({});
  const [lightning, setLightning] = useState(false);
  const [rules, setRules] = useState([]);
  const [drinks, setDrinks] = useState({});
  const [chaos, setChaos] = useState(null);
  const [water, setWater] = useState(null);
  const [prompt, setPrompt] = useState(null); // { kind: 'mlt' | 'nhie', text }
  const [bomb, setBomb] = useState(null);

  /* ── UI ── */
  const [spinning, setSpinning] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [toolToast, setToolToast] = useState(null);
  const [toolTargeting, setToolTargeting] = useState(null);
  const [voteTimeLeft, setVoteTimeLeft] = useState(0);
  const [lightningTimer, setLightningTimer] = useState(LIGHTNING_SECS);
  const [shake, setShake] = useState(false);
  const [sheet, setSheet] = useState(null);
  const voteHandledRef = useRef(null);
  const lightningHandledRef = useRef(false);

  useEffect(() => {
    setSecretMode(localStorage.getItem('xtasis_secret') === 'true');
    const requestedLevel = Number(new URLSearchParams(window.location.search).get('level'));
    if ([1, 2, 3].includes(requestedLevel)) setStartLevel(requestedLevel);
    return () => stopSpeaking();
  }, []);

  /* ── Setup ── */
  const updateSlot = (i, field, value) => setSlots(s => s.map((x, j) => (j === i ? { ...x, [field]: value } : x)));
  const addSlot = () => slots.length < 8 && setSlots(s => [...s, { id: `s${Date.now()}`, name: '', avatar: AVATARS[s.length % AVATARS.length] }]);
  const removeSlot = i => slots.length > 2 && setSlots(s => s.filter((_, j) => j !== i));
  const cycleAvatar = i => {
    feel('tick', 'tick');
    const cur = AVATARS.indexOf(slots[i].avatar);
    updateSlot(i, 'avatar', AVATARS[(cur + 1) % AVATARS.length]);
  };

  const startGame = () => {
    const valid = slots.filter(s => s.name.trim());
    if (valid.length < 2) return;
    const gp = valid.map(s => makePlayer(s.name, s.avatar));
    const lvl = secretMode ? 3 : startLevel;
    const t = {};
    gp.forEach(p => (t[p.id] = getRandomTools(TOOLS_AT_START)));

    setPlayers(gp);
    setLevel(lvl);
    setTurnIdx(Math.floor(Math.random() * gp.length));
    setCard(null);
    setPlayedIds([]);
    setLives(initPlayerLives(gp));
    setRevanchaUsed({});
    setTurnCount(0);
    setVoteState(null);
    setDuelState(null);
    setRevanchaState(null);
    setWinnerId(null);
    setEffects({});
    setStats({ cardsPlayed: 0, skips: 0, votesFailed: 0, perPlayer: {} });
    setTruthData({});
    setTools(t);
    setDareStreak({});
    setGoldenLeft(2);
    setGolden({});
    setLightning(false);
    setRules([]);
    setDrinks({});
    setChaos(null);
    setWater(null);
    setPrompt(null);
    setBomb(null);
    feel('levelup', 'heavy');
    setPhase('playing');
  };

  /* Placeholder: el compilador de React lee `cur.id` al renderizar, incluso en el setup sin jugadores */
  const cur = players[turnIdx] ?? NO_PLAYER;
  const curId = cur.id;

  const doShake = () => {
    setShake(true);
    feel('fail', 'fail');
    setTimeout(() => setShake(false), 500);
  };
  const bumpStat = (pid, key) => setStats(s => bump(s, pid, key));

  /* ── Mundo visual ── */
  useEffect(() => {
    if (phase !== 'playing') return;
    document.body.dataset.gameLevel = String(level);
    document.body.dataset.gamePhase = card ? 'focus' : 'play';
    document.body.classList.toggle('secret-active', secretMode);
    return () => {
      delete document.body.dataset.gameLevel;
      delete document.body.dataset.gamePhase;
      document.body.classList.remove('secret-active');
    };
  }, [phase, level, card, secretMode]);

  useEffect(() => {
    if (phase === 'setup') {
      document.body.dataset.gameLevel = String(secretMode ? 3 : startLevel);
      return () => delete document.body.dataset.gameLevel;
    }
  }, [phase, startLevel, secretMode]);

  /* Narrador */
  useEffect(() => {
    if (card) speak(card.text);
  }, [card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Relámpago ── */
  const lightningActive = lightning && !!card;
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
  }, [lightningActive, card?.id]);

  /* ── Votación ── */
  useEffect(() => {
    if (!voteState) {
      setVoteTimeLeft(0);
      return;
    }
    const tick = () => setVoteTimeLeft(Math.max(0, Math.ceil((voteState.expiresAt - Date.now()) / 1000)));
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [voteState]);

  /* ══════ Motor ══════ */
  const afterTurn = tc => {
    setTurnCount(tc);
    if (tc % 11 === 0) setWater({ startedAt: Date.now(), line: pick(WATER_LINES), acks: {} });
    else if (tc % 7 === 0) setChaos({ ...pick(CHAOS_EVENTS), key: Date.now() });
  };

  const advanceTurn = useCallback(
    aliveList => {
      const list = aliveList || getAlivePlayers(players, lives);
      if (!list.length) return;
      const pool = list.filter(p => p.id !== curId);
      const next = pick(pool.length ? pool : list);
      const idx = players.findIndex(p => p.id === next.id);
      if (idx < 0) return;
      setTruthData(prev => {
        const t = prev[next.id] || { streak: 0, lockedTurns: 0 };
        return { ...prev, [next.id]: { ...t, lockedTurns: Math.max(0, t.lockedTurns - 1) } };
      });
      setCard(null);
      setTurnIdx(idx);
    },
    [players, lives, curId],
  );

  const checkElimination = useCallback(
    (pid, newLives) => {
      if ((newLives[pid] ?? 0) > 0) return false;
      if (!revanchaUsed[pid] && getAlivePlayers(players, newLives).length >= 1) {
        setRevanchaUsed(prev => ({ ...prev, [pid]: true }));
        setRevanchaState({ playerId: pid, phase: 'offer' });
        return true;
      }
      const w = getWinnerId(players, newLives);
      if (w) setWinnerId(w);
      return false;
    },
    [players, revanchaUsed],
  );

  const resolveVote = useCallback(
    (votes, targetId, baseLives) => {
      const no = Object.values(votes).filter(v => v === 'no').length;
      const yes = Object.values(votes).filter(v => v === 'yes').length;
      let updated = { ...baseLives };
      let pendingRevancha = false;
      if (no > yes) {
        updated = loseLife(updated, targetId, 1);
        setStats(s => ({ ...s, votesFailed: s.votesFailed + 1 }));
        setDareStreak(prev => resetDareStreak(prev, targetId));
        pendingRevancha = checkElimination(targetId, updated);
      } else if (card?.type === 'dare') {
        const won = awardDareStreak(dareStreak, tools, targetId);
        setDareStreak(won.streaks);
        if (won.reward) {
          setTools(won.tools);
          const name = players.find(p => p.id === targetId)?.name || '';
          setToolToast({ text: `${name} cumplió ${DARE_STREAK_GOAL} retos seguidos y ganó ${won.reward.name}`, emoji: won.reward.emoji });
          setTimeout(() => setToolToast(null), 4000);
        }
      }
      setLives(updated);
      setVoteState(null);
      setCard(null);
      const tc = turnCount + 1;
      afterTurn(tc);
      if (getWinnerId(players, updated) || pendingRevancha) return;
      const alive = getAlivePlayers(players, updated);
      if (tc % DUEL_INTERVAL_TURNS === 0 && alive.length >= 2) {
        const [p1, p2] = [...alive].sort(() => Math.random() - 0.5);
        setDuelState({ player1Id: p1.id, player2Id: p2.id, card: drawOfflineCard(level, 'dare', players, p1, playedIds), votes: {}, phase: 'active' });
        return;
      }
      advanceTurn(alive);
    },
    [players, turnCount, level, playedIds, card, dareStreak, tools, checkElimination, advanceTurn],
  );

  useEffect(() => {
    if (!voteState || voteTimeLeft > 0) {
      if (!voteState) voteHandledRef.current = null;
      return;
    }
    const key = `${voteState.targetId}-${voteState.startedAt}`;
    if (voteHandledRef.current === key) return;
    voteHandledRef.current = key;
    resolveVote({ ...voteState.votes, offline: 'yes' }, voteState.targetId, lives);
  }, [voteState, voteTimeLeft, lives, resolveVote]);

  const handleDraw = useCallback(
    type => {
      if (spinning || !cur.id) return;
      const t = truthData[cur.id] || { streak: 0, lockedTurns: 0 };
      if (type === 'truth' && t.lockedTurns > 0) return;
      feel('pop', 'medium');

      let c;
      if (goldenLeft > 0 && !golden[cur.id] && Math.random() < GOLDEN_CHANCE) {
        c = { id: `golden_${Date.now()}`, type: 'golden', level, text: '✨ ¡Carta dorada! Úsala ahora para cancelar un reto sin perder vida… o guárdala para pedir un deseo al final.' };
        setGoldenLeft(n => n - 1);
        setGolden(prev => ({ ...prev, [cur.id]: 'held' }));
      } else {
        c = drawOfflineCard(level, type, players, cur, playedIds);
      }
      setCard(c);
      setPlayedIds(prev => [...prev, c.id]);

      if (c.type === 'truth') {
        const s = t.streak + 1;
        setTruthData(prev => ({ ...prev, [cur.id]: s >= 2 ? { streak: 0, lockedTurns: 2 } : { streak: s, lockedTurns: 0 } }));
        bumpStat(cur.id, 'truths');
      } else {
        if (t.streak > 0) setTruthData(prev => ({ ...prev, [cur.id]: { ...t, streak: 0 } }));
        if (c.type === 'dare') bumpStat(cur.id, 'dares');
      }
    },
    [spinning, cur, truthData, goldenLeft, golden, level, players, playedIds],
  );

  const handleComplete = useCallback(() => {
    if (!card || !cur.id) return;
    feel('success', 'success');
    const alive = getAlivePlayers(players, lives).filter(p => p.id !== cur.id);
    setStats(s => ({ ...s, cardsPlayed: s.cardsPlayed + 1 }));
    if (!alive.length) {
      setCard(null);
      advanceTurn();
      return;
    }
    setVoteState({ targetId: cur.id, cardId: card.id, votes: {}, startedAt: Date.now(), expiresAt: Date.now() + VOTE_DURATION_MS });
  }, [card, cur, players, lives, advanceTurn]);

  const handleVote = useCallback(
    vote => {
      if (!voteState) return;
      resolveVote({ ...voteState.votes, offline: vote }, voteState.targetId, lives);
    },
    [voteState, lives, resolveVote],
  );

  const handleDuelVote = useCallback(
    winner => {
      if (!duelState) return;
      const loser = winner === duelState.player1Id ? duelState.player2Id : duelState.player1Id;
      const updated = loseLife(lives, loser, 1);
      setLives(updated);
      doShake();
      const pending = checkElimination(loser, updated);
      setDuelState(null);
      if (!getWinnerId(players, updated) && !pending) advanceTurn(getAlivePlayers(players, updated));
    },
    [duelState, lives, players, checkElimination, advanceTurn],
  );

  const handleReturnChoice = useCallback(
    accept => {
      if (!revanchaState) return;
      const pid = revanchaState.playerId;
      const name = players.find(p => p.id === pid)?.name || '';
      const updated = { ...lives };
      if (accept) {
        updated[pid] = MAX_LIVES;
        setLives(updated);
        setToolToast({ text: `${name} volvió al juego con ${MAX_LIVES} vidas`, emoji: 'heart' });
      } else {
        const w = getWinnerId(players, updated);
        if (w) setWinnerId(w);
        setToolToast({ text: `${name} se queda fuera de la partida`, emoji: 'moon' });
      }
      setTimeout(() => setToolToast(null), 3500);
      setRevanchaState(null);
      if (!getWinnerId(players, updated)) advanceTurn(getAlivePlayers(players, updated));
    },
    [revanchaState, lives, players, advanceTurn],
  );

  const handleSkip = useCallback(() => {
    if (!cur.id) return;
    const fx = effects[cur.id] || {};
    let updated = lives;
    let pending = false;
    if (fx.immuneTurns > 0) {
      setEffects(prev => ({ ...prev, [cur.id]: { ...fx, immuneTurns: fx.immuneTurns - 1 } }));
    } else if (fx.freePass) {
      setEffects(prev => {
        const n = { ...prev[cur.id] };
        delete n.freePass;
        return { ...prev, [cur.id]: n };
      });
    } else {
      updated = loseLife(lives, cur.id, fx.doublePenalty ? 2 : 1);
      setLives(updated);
      doShake();
      if (fx.doublePenalty) {
        setEffects(prev => {
          const n = { ...prev[cur.id] };
          delete n.doublePenalty;
          return { ...prev, [cur.id]: n };
        });
      }
      pending = checkElimination(cur.id, updated);
      setStats(s => ({ ...s, skips: s.skips + 1 }));
      bumpStat(cur.id, 'skips');
    }
    setDareStreak(prev => resetDareStreak(prev, cur.id));
    setCard(null);
    afterTurn(turnCount + 1);
    if (!getWinnerId(players, updated) && !pending) advanceTurn(getAlivePlayers(players, updated));
  }, [cur, effects, lives, players, turnCount, checkElimination, advanceTurn]);

  /* Relámpago: al expirar el tiempo cuenta como "no me atrevo" */
  useEffect(() => {
    if (!lightningActive || lightningTimer > 0 || lightningHandledRef.current) return;
    lightningHandledRef.current = true;
    handleSkip();
  }, [lightningTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGolden = useCallback(
    useNow => {
      if (useNow) setGolden(prev => ({ ...prev, [cur.id]: 'used' }));
      setCard(null);
      advanceTurn();
    },
    [cur, advanceTurn],
  );

  const changeLevel = lvl => {
    if (lvl === level) return;
    const t = LEVEL_THEME[lvl];
    setLevelUpData({ level: lvl, ...t });
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: [t.color, '#ffe3e8', '#ff2d6f'] });
    setTimeout(() => setLevelUpData(null), 2800);
    setLevel(lvl);
    setCard(null);
  };

  const handleUseTool = useCallback(
    (tool, targetId = null) => {
      setToolTargeting(null);
      setSheet(null);
      setTools(prev => ({ ...prev, [cur.id]: (prev[cur.id] || []).filter(t => t.id !== tool.id) }));

      const fxSet = (pid, patch) => setEffects(prev => ({ ...prev, [pid]: { ...(prev[pid] || {}), ...patch } }));
      switch (tool.effect) {
        case 'steal_tool': {
          const list = tools[targetId] || [];
          if (list.length) {
            const stolen = pick(list);
            setTools(prev => ({
              ...prev,
              [targetId]: (prev[targetId] || []).filter(t => t.id !== stolen.id),
              [cur.id]: [...(prev[cur.id] || []).filter(t => t.id !== tool.id), stolen],
            }));
          }
          break;
        }
        case 'revive':
          setLives(prev => ({ ...prev, [targetId]: MAX_LIVES }));
          setEffects(prev => ({ ...prev, [targetId]: {} }));
          break;
        case 'amnesia': setPlayedIds([]); break;
        case 'gift_tool': setTools(prev => ({ ...prev, [targetId]: [...(prev[targetId] || []), drawTool()] })); break;
        case 'swap_turn': {
          const i = players.findIndex(p => p.id === targetId);
          if (i >= 0) { setCard(null); setTurnIdx(i); }
          break;
        }
        case 'gain_life': setLives(prev => gainLife(prev, cur.id, 1)); break;
        case 'heal_life': setLives(prev => gainLife(prev, targetId, 1)); break;
        case 'curse_life': {
          const after = loseLife(lives, targetId, 1);
          setLives(after);
          doShake();
          checkElimination(targetId, after);
          break;
        }
        case 'free_pass': fxSet(cur.id, { freePass: true }); break;
        case 'double_penalty': fxSet(targetId, { doublePenalty: true }); break;
        case 'life_shield': fxSet(cur.id, { immuneTurns: 2 }); break;
        case 'force_duel':
          setDuelState({ player1Id: cur.id, player2Id: targetId, card: drawOfflineCard(level, 'dare', players, cur, playedIds), votes: {}, phase: 'active' });
          setCard(null);
          break;
        default: break;
      }
      setToolToast({ text: buildToastText(tool, cur.name, players.find(p => p.id === targetId)?.name || ''), emoji: tool.emoji });
      feel('pop', 'medium');
      setTimeout(() => setToolToast(null), 4000);
    },
    [cur, players, tools, lives, level, playedIds, checkElimination],
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

  /* ═════════ SETUP ═════════ */
  if (phase === 'setup') {
    const validCount = slots.filter(s => s.name.trim()).length;
    return (
      <main className="local-setup min-h-dvh flex flex-col">
        <Marquee items={['Una pantalla', 'Todos los amigos', 'Tu mesa', 'La noche se juega']} className="tape-pink" speed={26} />
        <div className="setup-layout"><SetupIntro />
        <div className="setup-form flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Btn variant="ghost" size="sm" icon aria-label="Volver" onClick={() => router.push('/')}>
              <LuArrowLeft size={16} />
            </Btn>
            <div>
              <h2 className="font-display text-lg font-black uppercase leading-none">Una pantalla. Toda la mesa.</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Juega desde tu computadora, tablet o teléfono</p>
            </div>
          </div>

          <section className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-extrabold uppercase">Jugadores</h2>
              <span className="chip chip-on">{validCount}/8</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {slots.map((s, i) => (
                  <motion.div key={s.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2">
                    <motion.button type="button" whileTap={{ scale: 0.85, rotate: -10 }} onClick={() => cycleAvatar(i)} className="avatar avatar-md" style={{ cursor: 'pointer' }} aria-label="Cambiar avatar">
                      <PlayerSymbol symbol={s.avatar} />
                    </motion.button>
                    <input className="input" style={{ fontSize: '0.95rem' }} placeholder={`Jugador ${i + 1}`} maxLength={15} value={s.name} onChange={e => updateSlot(i, 'name', e.target.value)} />
                    {slots.length > 2 && (
                      <Btn variant="ghost" size="sm" icon aria-label="Quitar" onClick={() => removeSlot(i)}>
                        <LuX size={14} />
                      </Btn>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {slots.length < 8 && (
              <Btn variant="ghost" size="sm" full className="mt-3" onClick={addSlot}>
                <LuPlus size={14} /> Agregar jugador
              </Btn>
            )}
          </section>

          <section className="panel p-4">
            <p className="eyebrow mb-3">Nivel inicial</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(n => {
                const t = LEVEL_THEME[n];
                const active = (secretMode ? 3 : startLevel) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={secretMode}
                    onClick={() => { feel('click'); setStartLevel(n); }}
                    className="tile flex flex-col items-center text-center"
                    style={{ borderColor: active ? t.color : undefined, background: active ? `${t.color}1f` : undefined }}>
                    <span className="text-2xl mb-1"><PlayerSymbol symbol={t.emoji} /></span>
                    <span className="font-display text-[0.65rem] font-extrabold uppercase" style={{ color: active ? t.color : 'var(--muted)' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
            {secretMode && <p className="text-xs text-center mt-3 font-bold" style={{ color: 'var(--pink)' }}>✦ Modo oscuro: nivel máximo</p>}
          </section>

          <Btn variant="acid" size="xl" full onClick={startGame} disabled={validCount < 2}>
            {validCount < 2 ? 'Mínimo 2 jugadores' : `Comenzar con ${validCount}`}
          </Btn>
        </div></div>
      </main>
    );
  }

  /* ═════════ JUEGO ═════════ */
  if (winnerId) {
    return (
      <Recap
        winnerId={winnerId}
        players={players}
        stats={stats}
        drinks={drinks}
        gameId="OFFLINE"
        onClose={() => { setPhase('setup'); setWinnerId(null); }}
      />
    );
  }

  const theme = LEVEL_THEME[level];
  const isGolden = card?.type === 'golden';
  const myLives = lives[curId] ?? MAX_LIVES;
  const t = truthData[curId] || { streak: 0, lockedTurns: 0 };
  const myTools = tools[curId] || [];
  const alive = getAlivePlayers(players, lives);
  const modal = !!(voteState || duelState || revanchaState || chaos || water || prompt || bomb);

  return (
    <main className={`table-game min-h-dvh flex flex-col ${shake ? 'shake' : ''}`}>
      <TableIdentity />
      <header className="hud">
        <Btn variant="ghost" size="sm" icon aria-label="Salir" onClick={() => { setPhase('setup'); }}>
          <LuArrowLeft size={16} />
        </Btn>
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,.4)', border: '1px solid var(--line)' }} role="group" aria-label="Nivel">
          {[1, 2, 3].map(n => {
            const th = LEVEL_THEME[n];
            const active = level === n;
            return (
              <button key={n} type="button" aria-pressed={active} aria-label={`Nivel ${n}`} onClick={() => { feel('click'); changeLevel(n); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: active ? th.color : 'transparent', color: active ? '#1a0a00' : 'var(--muted)', boxShadow: active ? `0 0 16px ${th.color}88` : 'none', border: 0, cursor: 'pointer', transform: active ? 'scale(1.08)' : 'scale(1)', transition: 'all .2s var(--ease-snap)' }}>
                {active ? <PlayerSymbol symbol={th.emoji} size={22} /> : n}
              </button>
            );
          })}
        </div>
        <div className="flex-1 min-w-0 text-center">
          <p className="font-display text-[0.62rem] font-extrabold uppercase truncate" style={{ color: 'var(--accent)' }}>{theme.label}</p>
          <p className="font-mono text-[0.58rem]" style={{ color: 'var(--subtle)' }}>turno {turnCount} · mesa compartida</p>
        </div>
        <Pips lives={myLives} />
        <Btn variant="ghost" size="sm" icon aria-label="Ajustes" onClick={() => setSheet('settings')}>
          <LuHeart size={16} />
        </Btn>
      </header>

      <div className="table-tools px-3 pt-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Chip icon={<LuMartini size={14} />} label="Cócteles" count={myTools.length} onClick={() => setSheet('tools')} />
          <Chip icon={<LuSparkles size={14} />} label="Modos" hot onClick={() => setSheet('party')} />
          <Chip icon={<LuScrollText size={14} />} label="Leyes" count={rules.length} onClick={() => setSheet('rules')} />
          <Chip icon={<LuBeer size={14} />} label="Tragos" onClick={() => setSheet('drinks')} />
          <Chip icon={<LuZap size={14} />} label="Relámpago" on={lightning} onClick={() => setLightning(v => !v)} />
        </div>
        <DesktopTable player={cur} round={turnCount} players={players.length} onDraw={handleDraw} canDraw={!card && !spinning && !modal && !sheet} truthLocked={t.lockedTurns > 0} />
      </div>

      <section className="table-stage flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4 justify-center">
        {rules.length > 0 && (
          <button type="button" onClick={() => setSheet('rules')} className="banner text-left" style={{ cursor: 'pointer', color: 'var(--paper)' }}>
            <span className="text-lg">📜</span>
            <span className="flex-1 min-w-0 truncate text-[0.78rem]"><b style={{ color: 'var(--accent)' }}>Ley vigente:</b> {rules[rules.length - 1].text}</span>
            {rules.length > 1 && <span className="chip chip-on">+{rules.length - 1}</span>}
          </button>
        )}

        <div style={{ display: card ? 'none' : 'block' }}>
          <div className="text-center mb-4">
            <p className="eyebrow mb-2">{spinning ? 'Sorteando turno…' : 'Es el turno de'}</p>
            <AnimatePresence mode="wait">
              <motion.h2 key={spinning ? 'spin' : curId} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14 }} transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                className="font-display font-black uppercase leading-none whitespace-nowrap" style={{ fontSize: 'clamp(1.8rem, 9vw, 2.7rem)', textShadow: '0 0 34px var(--accent-glow)' }}>
                {spinning ? '· · ·' : cur?.name}
              </motion.h2>
            </AnimatePresence>
          </div>

          <TurnWheel players={players} lives={lives} targetId={curId} active={spinning} initialSpin={turnCount === 0} onSpinChange={setSpinning} />

          {!spinning && !modal && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-7 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <Btn variant="cyan" size="xl" full onClick={() => handleDraw('truth')} disabled={t.lockedTurns > 0}>💭 Verdad</Btn>
                  {t.lockedTurns > 0 && <span className="text-[0.65rem] font-bold" style={{ color: 'var(--muted)' }}>🔒 bloqueada {t.lockedTurns} turno{t.lockedTurns !== 1 ? 's' : ''}</span>}
                </div>
                <Btn variant="pink" size="xl" full onClick={() => handleDraw('dare')}>🔥 Reto</Btn>
              </div>
              <Btn variant="acid" full onClick={() => handleDraw('random')}>🎲 Sorpréndeme</Btn>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {card && (
            <motion.div key={card.id} className="flex flex-col gap-4" exit={{ opacity: 0 }}>
              {lightning && (
                <div className="timer-bar" aria-hidden="true">
                  <i style={{ width: `${(lightningTimer / LIGHTNING_SECS) * 100}%`, background: lightningTimer <= 10 ? 'var(--pink)' : 'var(--gold)' }} />
                </div>
              )}
              <p className="text-center eyebrow">Turno de <b style={{ color: 'var(--accent)' }}>{cur?.name}</b></p>
              <CardStage card={card} lives={myLives} level={level} />
              {isGolden ? (
                <div className="grid grid-cols-2 gap-3">
                  <Btn variant="acid" onClick={() => handleGolden(true)}>✨ Usar ya</Btn>
                  <Btn variant="ghost" onClick={() => handleGolden(false)}>🌟 Guardar</Btn>
                </div>
              ) : (
                !voteState && (
                  <div className="flex gap-3">
                    <Btn variant="outline" className="btn-pink flex-1" onClick={handleSkip}><LuSkipForward size={15} /> No me atrevo</Btn>
                    <Btn variant="acid" className="flex-1" onClick={handleComplete}><LuCheck size={16} /> Cumplí</Btn>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <PlayerDock players={players} lives={lives} activeId={curId} myId="" golden={Object.fromEntries(Object.entries(golden).map(([k, v]) => [k, { status: v }]))} drinks={drinks} />

      {/* Capas */}
      <AnimatePresence>
        {toolToast && <ToolToast key="toast" toast={toolToast} />}
        {levelUpData && <LevelUpOverlay key="lvl" data={levelUpData} />}
        {toolTargeting && <TargetPicker key="target" tool={toolTargeting} players={players} myId={curId} lives={lives} onPick={id => handleUseTool(toolTargeting, id)} onCancel={() => setToolTargeting(null)} />}
        {voteState && <VoteOverlay key="vote" voteState={voteState} players={players} myId="offline" onVote={handleVote} timeLeft={voteTimeLeft} />}
        {duelState && <DuelOverlay key="duel" duelState={duelState} players={players} myId="offline" onVote={handleDuelVote} />}
        {revanchaState && (
          <ReturnOverlay key="rev" state={revanchaState} players={players} myId="offline" onChoice={handleReturnChoice} />
        )}
        {prompt && <PromptOverlay key="prompt" prompt={prompt} onNext={() => setPrompt(p => ({ ...p, text: pick(p.kind === 'mlt' ? MLT_PROMPTS : NHIE_PROMPTS) }))} onClose={() => setPrompt(null)} />}
        {bomb && (
          <LocalBomb key="bomb" bomb={bomb} players={alive} onPass={() => setBomb(b => ({ ...b, passes: b.passes + 1 }))}
            onExplode={() => setBomb(b => (b.phase === 'live' ? { ...b, phase: 'pick' } : b))}
            onLoser={id => {
              const updated = loseLife(lives, id, 1);
              setLives(updated);
              bumpStat(id, 'bombs');
              setBomb(b => ({ ...b, phase: 'boom', loserId: id }));
              const pending = checkElimination(id, updated);
              if (pending) setBomb(null);
            }}
            onClose={() => setBomb(null)} />
        )}
        {chaos && !prompt && !bomb && <ChaosOverlay key="chaos" chaos={chaos} onDismiss={() => setChaos(null)} />}
        {water && !chaos && !prompt && !bomb && <WaterOverlay key="water" water={water} myId="offline" alivePlayers={[]} onAck={() => setWater(null)} />}
      </AnimatePresence>

      {/* Sheets */}
      <ToolsSheet open={sheet === 'tools'} onOpenChange={o => !o && setSheet(null)} tools={myTools} streak={dareStreak[curId] || 0} anyFallen={anyFallen} onUse={startToolUse} />
      <RulesSheet open={sheet === 'rules'} onOpenChange={o => !o && setSheet(null)} rules={rules} players={players} isHost
        onAdd={text => setRules(r => [...r, { id: String(Date.now()), text, by: curId }].slice(-5))}
        onRemove={id => setRules(r => r.filter(x => x.id !== id))} />
      <DrinksSheet open={sheet === 'drinks'} onOpenChange={o => !o && setSheet(null)} players={players} drinks={drinks}
        onDrink={(id, d) => { setDrinks(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + d) })); if (d > 0) bumpStat(id, 'drinks'); }} />
      <SettingsSheet open={sheet === 'settings'} onOpenChange={o => !o && setSheet(null)} />
      <Sheet open={sheet === 'party'} onOpenChange={o => !o && setSheet(null)} title="Modos sorpresa" subtitle="Para toda la mesa, con un solo celular">
        <div className="bento">
          {[
            { k: 'mlt', e: '🎯', t: 'Quién es más probable', s: 'Todos señalan a la cuenta de 3', cls: 'span-3' },
            { k: 'nhie', e: '🙋', t: 'Yo nunca', s: 'Quien sí lo hizo, bebe', cls: 'span-3' },
            { k: 'bomb', e: '💣', t: 'Papa caliente', s: 'Pasen el celular antes de que explote', cls: 'span-6' },
            { k: 'chaos', e: '🌪️', t: 'Lanzar caos', s: 'Evento sorpresa', cls: 'span-3' },
            { k: 'rules', e: '📜', t: 'Nueva ley', s: 'Dicta una regla', cls: 'span-3' },
          ].map(m => (
            <button key={m.k} className={`tile tile-glow ${m.cls}`} onClick={() => {
              feel('pop', 'medium');
              setSheet(null);
              if (m.k === 'mlt') setPrompt({ kind: 'mlt', text: pick(MLT_PROMPTS) });
              if (m.k === 'nhie') setPrompt({ kind: 'nhie', text: pick(NHIE_PROMPTS) });
              if (m.k === 'bomb') setBomb({ category: pick(BOMB_CATEGORIES), startedAt: Date.now(), explodesAt: Date.now() + 14000 + Math.random() * 18000, passes: 0, phase: 'live' });
              if (m.k === 'chaos') setChaos({ ...pick(CHAOS_EVENTS), key: Date.now() });
              if (m.k === 'rules') setTimeout(() => setSheet('rules'), 250);
            }}>
              <span className="tile-emoji">{m.e}</span>
              <p className="tile-title">{m.t}</p>
              <p className="tile-sub">{m.s}</p>
            </button>
          ))}
        </div>
      </Sheet>
    </main>
  );
}

/* ── chip de acción ── */
function Chip({ icon, label, count, on, hot, onClick }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => { feel('click'); onClick(); }}
      className={`chip shrink-0 ${on ? 'chip-on' : ''}`} style={{ cursor: 'pointer', padding: '0.5rem 0.85rem', borderColor: hot ? 'var(--accent)' : undefined }}>
      {icon} {label}
      {count > 0 && <span className="rounded-full px-1.5 text-[0.6rem] font-black" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{count}</span>}
    </motion.button>
  );
}

/* ── "Quién es más probable" / "Yo nunca" en un solo celular ── */
function PromptOverlay({ prompt, onNext, onClose }) {
  const mlt = prompt.kind === 'mlt';
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="sheet text-center" initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }} style={{ borderColor: mlt ? 'var(--acid)' : 'var(--cyan)' }}>
        <span className={`sticker ${mlt ? '' : 'sticker-cyan'}`}>{mlt ? '🎯 ¿Quién es más probable?' : '🙋 Yo nunca'}</span>
        <AnimatePresence mode="wait">
          <motion.h3 key={prompt.text} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            className="font-display text-lg font-black uppercase leading-snug my-5 text-balance">
            {mlt ? `…de ${prompt.text}` : <>Yo nunca… <span className="rainbow-text">{prompt.text}</span></>}
          </motion.h3>
        </AnimatePresence>
        <p className="text-sm font-semibold mb-5" style={{ color: 'var(--muted)' }}>
          {mlt ? 'A la cuenta de 3, todos señalan. El más señalado bebe' : 'Quien sí lo ha hecho, bebe'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Btn variant="ghost" onClick={onNext}>Otra</Btn>
          <Btn variant={mlt ? 'acid' : 'cyan'} onClick={onClose}>Listo</Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Papa caliente local ── */
function LocalBomb({ bomb, players, onPass, onExplode, onLoser, onClose }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (bomb.phase !== 'live') return;
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, [bomb.phase]);

  const urgency = Math.min(1, Math.max(0, (now - bomb.startedAt) / (bomb.explodesAt - bomb.startedAt)));
  const tickMs = Math.round(900 - urgency * 720);

  useEffect(() => {
    if (bomb.phase === 'live' && now >= bomb.explodesAt) {
      feel('boom', 'boom');
      onExplode();
    }
  }, [now, bomb, onExplode]);

  useEffect(() => {
    if (bomb.phase !== 'live') return;
    const iv = setInterval(() => feel('bomb', 'tick'), tickMs);
    return () => clearInterval(iv);
  }, [bomb.phase, tickMs]);

  const loser = players.find(p => p.id === bomb.loserId);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="sheet text-center" initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ borderColor: 'var(--orange)', boxShadow: '0 0 70px rgba(255,122,26,.35)' }}>
        <span className="sticker sticker-orange">💣 Papa caliente</span>
        {bomb.phase === 'live' && (
          <>
            <motion.div animate={{ scale: [1, 1.1 + urgency * 0.12, 1], rotate: urgency > 0.6 ? [-4, 4, -4] : 0 }}
              transition={{ duration: Math.max(0.2, tickMs / 1000), repeat: Infinity }} className="text-8xl my-5"
              style={{ filter: `drop-shadow(0 0 ${14 + urgency * 40}px rgba(255,100,26,.9))` }}>💣</motion.div>
            <p className="eyebrow mb-1">Categoría</p>
            <h3 className="font-display text-xl font-black uppercase mb-4 rainbow-text">{bomb.category}</h3>
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--muted)' }}>Di una palabra y pasa el celular al de al lado. ¡Sin repetir!</p>
            <Btn variant="orange" size="xl" full onClick={() => { feel('pop', 'medium'); onPass(); }}>¡Ya la pasé! ({bomb.passes})</Btn>
          </>
        )}
        {bomb.phase === 'pick' && (
          <>
            <div className="text-7xl my-4">💥</div>
            <h3 className="font-display text-lg font-black uppercase mb-4">¿Quién la tenía?</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {players.map(p => (
                <motion.button key={p.id} whileTap={{ scale: 0.85 }} className="panel-2 flex flex-col items-center gap-1.5 py-3" style={{ cursor: 'pointer', color: 'var(--paper)' }} onClick={() => onLoser(p.id)}>
                  <Avatar player={p} size="md" />
                  <span className="text-[0.7rem] font-bold truncate max-w-full px-1">{p.name}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
        {bomb.phase === 'boom' && (
          <>
            <motion.div initial={{ scale: 0.2 }} animate={{ scale: [0.2, 1.5, 1.15] }} className="text-8xl my-4">💥</motion.div>
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <Avatar player={loser} size="lg" active />
              <span className="font-bold text-left">{loser?.name}<br /><span style={{ color: 'var(--pink)' }}>pierde una vida</span></span>
            </div>
            <Btn variant="orange" size="xl" full onClick={onClose}>Seguir jugando</Btn>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
