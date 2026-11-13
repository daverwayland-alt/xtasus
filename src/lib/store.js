// Store en memoria (requiere un servidor Node persistente — no serverless).
// globalThis evita que HMR reinicie el estado en desarrollo.
import { initPlayerLives } from './lives';

const g = globalThis;

if (!g.xtasisGames) g.xtasisGames = {};
if (!g.xtasisSubs) g.xtasisSubs = {};

export const getGames = () => g.xtasisGames;

/* ── Pub/Sub para SSE ── */
export function subscribe(id, fn) {
  (g.xtasisSubs[id] ||= new Set()).add(fn);
  return () => {
    g.xtasisSubs[id]?.delete(fn);
    if (g.xtasisSubs[id]?.size === 0) delete g.xtasisSubs[id];
  };
}

export function notify(id) {
  const game = g.xtasisGames[id];
  if (!game) return;
  g.xtasisSubs[id]?.forEach(fn => {
    try {
      fn(game);
    } catch {}
  });
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para evitar confusión

const newId = () => {
  let id = '';
  for (let i = 0; i < 4; i++) id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  return id;
};

/* Limpia salas inactivas (6 h) para no crecer sin límite */
function sweep() {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const id of Object.keys(g.xtasisGames)) {
    if ((g.xtasisGames[id].updatedAt ?? 0) < cutoff) delete g.xtasisGames[id];
  }
}

export const createGame = () => {
  sweep();
  let id = newId();
  while (g.xtasisGames[id]) id = newId();

  const state = {
    id,
    status: 'lobby',
    players: [],
    currentLevel: 1,
    currentTurnPlayerId: null,
    currentCard: null,
    playedCards: [],
    turnCount: 0,

    playerLives: {},
    revanchaUsed: {},
    eliminatedOrder: [],
    winnerId: null,

    playerTruthData: {},
    playerTools: {},
    playerDareStreak: {},
    playerEffects: {},
    lastToolEffect: null,

    lightningMode: false,
    goldenCardsLeft: 2,
    playerGoldenCards: {},

    voteState: null,
    duelState: null,
    revanchaState: null,
    pendingCardType: null,

    lastCompletedCard: null,
    stats: { cardsPlayed: 0, skips: 0, votesFailed: 0, perPlayer: {} },

    /* ── v3: modos de fiesta ── */
    customCards: [],
    rules: [], // [{ id, text, by }]
    mlt: null, // "¿Quién es más probable?"
    nhie: null, // "Yo nunca"
    bomb: null, // "Papa caliente"
    chaos: null, // evento de caos activo
    waterBreak: null, // pausa de agua
    missions: {}, // { [pid]: { text, done } }
    reactions: [], // [{ id, pid, emoji, t }]
    drinks: {}, // contador de tragos compartido { [pid]: n }
    partyOptions: { chaos: true, water: true },

    updatedAt: Date.now(),
  };

  g.xtasisGames[id] = state;
  return state;
};

export const getGame = id => g.xtasisGames[id] || null;

export const updateGame = (id, updates) => {
  if (!g.xtasisGames[id]) return null;
  g.xtasisGames[id] = { ...g.xtasisGames[id], ...updates, updatedAt: Date.now() };
  notify(id);
  return g.xtasisGames[id];
};

export const joinGame = (gameId, player) => {
  const game = getGame(gameId);
  if (!game) return null;
  if (game.status !== 'lobby') return { error: 'La partida ya empezó.' };
  if (game.players.length >= 8) return { error: 'La sala está llena (máx. 8).' };

  const existing = game.players.find(p => p.name.toLowerCase() === player.name.toLowerCase());
  if (existing) return { error: 'El nombre ya está en uso en esta sala.' };

  const newPlayer = {
    id: crypto.randomUUID(),
    name: player.name,
    avatar: player.avatar || '👽',
    isHost: game.players.length === 0,
  };

  game.players.push(newPlayer);
  game.playerLives = initPlayerLives(game.players);
  game.revanchaUsed = { ...game.revanchaUsed, [newPlayer.id]: false };
  game.updatedAt = Date.now();
  notify(gameId);
  return { game, player: newPlayer };
};
