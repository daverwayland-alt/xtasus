/* ═══════════════════════════════════════════════════════════
   MOTOR DE MODOS DE FIESTA (lado servidor)
   Devuelve { updates } para aplicar con updateGame, o { error }.
   ═══════════════════════════════════════════════════════════ */
import {
  MLT_PROMPTS,
  NHIE_PROMPTS,
  CHAOS_EVENTS,
  MISSIONS,
  BOMB_CATEGORIES,
  WATER_LINES,
} from '@/data/party';
import { getAlivePlayers, loseLife } from '@/lib/lives';

export const CHAOS_EVERY_TURNS = 7;
export const WATER_EVERY_TURNS = 11;
export const BOMB_MIN_MS = 14000;
export const BOMB_MAX_MS = 32000;

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function bump(stats, pid, key, n = 1) {
  const perPlayer = { ...(stats?.perPlayer || {}) };
  perPlayer[pid] = { ...(perPlayer[pid] || {}), [key]: (perPlayer[pid]?.[key] || 0) + n };
  return { ...stats, perPlayer };
}

export function assignMissions(players) {
  const pool = shuffle(MISSIONS);
  const out = {};
  players.forEach((p, i) => {
    out[p.id] = { text: pool[i % pool.length], done: false };
  });
  return out;
}

/* Inyecta caos / pausa de agua cuando avanza el contador de turnos. */
export function injectEvents(game, updates) {
  const turn = updates.turnCount ?? game.turnCount ?? 0;
  const opts = game.partyOptions || {};
  if (turn <= 0 || turn === game.turnCount) return updates;

  if (opts.water !== false && turn % WATER_EVERY_TURNS === 0) {
    updates.waterBreak = { startedAt: Date.now(), line: pick(WATER_LINES), acks: {} };
  } else if (opts.chaos !== false && turn % CHAOS_EVERY_TURNS === 0 && !game.chaos) {
    updates.chaos = { ...pick(CHAOS_EVENTS), startedAt: Date.now(), key: uid() };
  }
  return updates;
}

/**
 * @param {object} game     estado actual
 * @param {object} body     body del POST
 * @param {object} helpers  { checkElimination } (viene del route para no duplicar)
 */
export function handleParty(game, body, helpers) {
  const { action, playerId: pid } = body;
  const alive = getAlivePlayers(game.players, game.playerLives || {});
  const isHost = game.players.find(p => p.id === pid)?.isHost;

  switch (action) {
    /* ─────────── Reacciones en vivo ─────────── */
    case 'react': {
      if (!pid || !body.emoji) return { error: 'Reacción inválida' };
      const reactions = [...(game.reactions || []), { id: uid(), pid, emoji: String(body.emoji).slice(0, 4), t: Date.now() }].slice(-16);
      return { updates: { reactions, stats: bump(game.stats, pid, 'reactions') } };
    }

    /* ─────────── Contador de tragos compartido ─────────── */
    case 'drink': {
      const target = body.targetId || pid;
      if (!game.players.some(p => p.id === target)) return { error: 'Jugador inválido' };
      const delta = body.delta > 0 ? 1 : -1;
      const cur = game.drinks?.[target] || 0;
      const next = Math.max(0, cur + delta);
      if (next === cur) return { updates: {} };
      return {
        updates: {
          drinks: { ...(game.drinks || {}), [target]: next },
          stats: bump(game.stats, target, 'drinks', next - cur),
        },
      };
    }

    /* ─────────── Confesionario anónimo ─────────── */
    case 'submitConfession': {
      const text = String(body.text || '').trim().slice(0, 160);
      if (!text) return { error: 'Escribe algo' };
      if ((game.customCards || []).length >= 60) return { error: 'El confesionario está lleno' };
      const type = body.type === 'truth' ? 'truth' : 'dare';
      const card = { id: `anon_${uid()}`, type, text, level: 1, custom: true, anon: true };
      return { updates: { customCards: [...(game.customCards || []), card] } };
    }

    /* ─────────── Leyes del juego ─────────── */
    case 'addRule': {
      const text = String(body.text || '').trim().slice(0, 90);
      if (!text) return { error: 'Escribe la ley' };
      const rules = [...(game.rules || []), { id: uid(), text, by: pid }].slice(-5);
      return { updates: { rules } };
    }
    case 'removeRule': {
      if (!isHost) return { error: 'Solo el host puede derogar leyes' };
      return { updates: { rules: (game.rules || []).filter(r => r.id !== body.ruleId) } };
    }

    /* ─────────── Opciones (host) ─────────── */
    case 'setPartyOptions': {
      if (!isHost) return { error: 'Solo el host' };
      return { updates: { partyOptions: { ...(game.partyOptions || {}), ...(body.options || {}) } } };
    }

    /* ─────────── Caos / agua ─────────── */
    case 'chaosDismiss':
      return { updates: { chaos: null } };
    case 'triggerChaos': {
      if (!isHost) return { error: 'Solo el host' };
      return { updates: { chaos: { ...pick(CHAOS_EVENTS), startedAt: Date.now(), key: uid() } } };
    }
    case 'waterAck': {
      const wb = game.waterBreak;
      if (!wb) return { updates: {} };
      const acks = { ...wb.acks, [pid]: true };
      const done = alive.every(p => acks[p.id]);
      return { updates: { waterBreak: done ? null : { ...wb, acks } } };
    }
    case 'waterDone':
      return { updates: { waterBreak: null } };

    /* ─────────── Misiones secretas ─────────── */
    case 'missionDone': {
      const m = game.missions?.[pid];
      if (!m || m.done) return { updates: {} };
      return {
        updates: {
          missions: { ...game.missions, [pid]: { ...m, done: true } },
          stats: bump(game.stats, pid, 'missions'),
        },
      };
    }

    /* ─────────── ¿Quién es más probable? ─────────── */
    case 'startMlt': {
      if (game.mlt || game.nhie || game.bomb) return { error: 'Ya hay un mini-juego activo' };
      const prompt = pick(MLT_PROMPTS);
      return { updates: { mlt: { prompt, votes: {}, phase: 'vote', startedAt: Date.now() }, currentCard: null } };
    }
    case 'mltVote': {
      const m = game.mlt;
      if (!m || m.phase !== 'vote') return { updates: {} };
      const votes = { ...m.votes, [pid]: body.targetId };
      if (!alive.every(p => votes[p.id])) return { updates: { mlt: { ...m, votes } } };

      const counts = {};
      Object.values(votes).forEach(t => (counts[t] = (counts[t] || 0) + 1));
      const max = Math.max(...Object.values(counts));
      const winnerIds = Object.keys(counts).filter(k => counts[k] === max);
      let stats = game.stats;
      winnerIds.forEach(w => (stats = bump(stats, w, 'mltVotes', max)));
      return { updates: { mlt: { ...m, votes, phase: 'result', result: { counts, winnerIds } }, stats } };
    }

    /* ─────────── Yo nunca ─────────── */
    case 'startNhie': {
      if (game.mlt || game.nhie || game.bomb) return { error: 'Ya hay un mini-juego activo' };
      return { updates: { nhie: { prompt: pick(NHIE_PROMPTS), answers: {}, phase: 'answer', startedAt: Date.now() }, currentCard: null } };
    }
    case 'nhieAnswer': {
      const n = game.nhie;
      if (!n || n.phase !== 'answer') return { updates: {} };
      const answers = { ...n.answers, [pid]: !!body.did };
      if (!alive.every(p => p.id in answers)) return { updates: { nhie: { ...n, answers } } };
      const drinkers = Object.keys(answers).filter(k => answers[k]);
      return { updates: { nhie: { ...n, answers, phase: 'result', result: { drinkers } } } };
    }

    /* ─────────── Papa caliente (bomba) ─────────── */
    case 'startBomb': {
      if (game.mlt || game.nhie || game.bomb) return { error: 'Ya hay un mini-juego activo' };
      if (alive.length < 2) return { error: 'Faltan jugadores' };
      const holder = pid && alive.find(p => p.id === pid) ? pid : pick(alive).id;
      const fuse = BOMB_MIN_MS + Math.random() * (BOMB_MAX_MS - BOMB_MIN_MS);
      return {
        updates: {
          bomb: {
            holderId: holder,
            category: pick(BOMB_CATEGORIES),
            startedAt: Date.now(),
            explodesAt: Date.now() + fuse,
            passes: 0,
            phase: 'live',
            history: [holder],
          },
          currentCard: null,
        },
      };
    }
    case 'bombPass': {
      const b = game.bomb;
      if (!b || b.phase !== 'live' || b.holderId !== pid) return { updates: {} };
      if (Date.now() >= b.explodesAt) return { updates: {} };
      if (!body.targetId || body.targetId === pid) return { error: 'Elige a otro jugador' };
      return { updates: { bomb: { ...b, holderId: body.targetId, passes: b.passes + 1, history: [...b.history, body.targetId] } } };
    }
    case 'bombCheck': {
      const b = game.bomb;
      if (!b || b.phase !== 'live' || Date.now() < b.explodesAt) return { updates: {} };
      let lives = loseLife({ ...game.playerLives }, b.holderId, 1);
      let updates = {
        bomb: { ...b, phase: 'boom', loserId: b.holderId },
        playerLives: lives,
        stats: bump(game.stats, b.holderId, 'bombs'),
      };
      updates = helpers.checkElimination({ ...game, stats: updates.stats }, lives, b.holderId, updates);
      return { updates };
    }

    /* ─────────── Cerrar mini-juegos ─────────── */
    case 'partyClose': {
      if (!game.mlt && !game.nhie && !game.bomb) return { updates: {} };
      return { updates: { mlt: null, nhie: null, bomb: null } };
    }

    default:
      return null;
  }
}

/* ── Premios de la noche (se calculan en cliente y servidor con la misma lógica) ── */
export function computeAwards(players, stats, defs) {
  const per = stats?.perPlayer || {};
  const out = [];
  defs.forEach(def => {
    let best = null;
    let bestN = 0;
    players.forEach(p => {
      const n = per[p.id]?.[def.key] || 0;
      if (n > bestN) {
        best = p;
        bestN = n;
      }
    });
    if (best) out.push({ ...def, player: best, value: bestN });
  });
  return out;
}
