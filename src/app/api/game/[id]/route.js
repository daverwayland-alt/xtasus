import { NextResponse } from 'next/server';
import { getGame, updateGame, joinGame } from '@/lib/store';
import { getRandomTools, drawTool, buildToastText, TOOLS_AT_START, DARE_STREAK_GOAL } from '@/data/tools';
import { awardDareStreak, resetDareStreak } from '@/lib/rewards';
import { getRandomCard } from '@/data/cards';
import { loseLife, gainLife, getAlivePlayers, getWinnerId, isAlive } from '@/lib/lives';
import { DUEL_INTERVAL_TURNS, VOTE_DURATION_MS, MAX_LIVES, RETURN_DECISION_MS } from '@/lib/gameConstants';
import { handleParty, injectEvents, assignMissions, bump } from '@/lib/party';

export async function GET(req, { params }) {
  const { id } = await params;
  const gameId = id.toUpperCase();
  const game = getGame(gameId);
  if (!game) return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
  return NextResponse.json(game);
}

function playerName(game, id) {
  return game.players.find(p => p.id === id)?.name || 'Alguien';
}

function applyToolEffects(game, tool, pid, targetId, updates) {
  const lives = { ...(updates.playerLives || game.playerLives || {}) };
  const effects = { ...(updates.playerEffects || game.playerEffects || {}) };
  const currentTools = updates.playerTools || JSON.parse(JSON.stringify(game.playerTools || {}));

  switch (tool.effect) {
    case 'gain_life':
      updates.playerLives = gainLife(lives, pid, 1);
      break;
    case 'heal_life':
      if (targetId) updates.playerLives = gainLife(lives, targetId, 1);
      break;
    case 'curse_life':
      if (targetId) updates.playerLives = loseLife(lives, targetId, 1);
      break;
    case 'free_pass':
      effects[pid] = { ...(effects[pid] || {}), freePass: true };
      updates.playerEffects = effects;
      break;
    case 'nullify_dare':
      if (targetId && game.currentTurnPlayerId === targetId) {
        updates.currentCard = null;
      }
      break;
    case 'redirect_dare':
      if (targetId && game.currentCard) {
        updates.currentTurnPlayerId = targetId;
      }
      break;
    case 'mirror_dare':
      effects[pid] = { ...(effects[pid] || {}), mirrorActive: true };
      updates.playerEffects = effects;
      break;
    case 'steal_tool':
      if (targetId) {
        const targetList = currentTools[targetId] || [];
        if (targetList.length > 0) {
          const idx = Math.floor(Math.random() * targetList.length);
          const stolen = targetList[idx];
          currentTools[targetId] = targetList.filter(t => t.id !== stolen.id);
          currentTools[pid] = [...(currentTools[pid] || []), stolen];
        }
        updates.playerTools = currentTools;
      }
      break;
    case 'double_penalty':
      if (targetId) {
        effects[targetId] = { ...(effects[targetId] || {}), doublePenalty: true };
        updates.playerEffects = effects;
      }
      break;
    case 'amnesia':
      updates.playedCards = [];
      break;
    case 'swap_turn':
      if (targetId) {
        updates.currentTurnPlayerId = targetId;
        updates.currentCard = null;
      }
      break;
    case 'revive':
      if (targetId && (lives[targetId] ?? 0) <= 0) {
        updates.playerLives = { ...lives, [targetId]: MAX_LIVES };
        updates.eliminatedOrder = (updates.eliminatedOrder || game.eliminatedOrder || []).filter(id => id !== targetId);
        effects[targetId] = {};
        updates.playerEffects = effects;
      }
      break;
    case 'gift_tool':
      if (targetId) {
        const extra = [drawTool()];
        currentTools[targetId] = [...(currentTools[targetId] || []), ...extra];
        updates.playerTools = currentTools;
      }
      break;
    case 'force_duel': {
      if (!targetId) break;
      const level = game.currentLevel;
      const names = game.players.map(p => p.name);
      const card = getRandomCard(level, 'dare', names, playerName(game, pid), game.playedCards || []);
      updates.duelState = {
        player1Id: pid,
        player2Id: targetId,
        card,
        votes: {},
        phase: 'active',
        startedAt: Date.now(),
      };
      updates.currentCard = null;
      break;
    }
    case 'turbo':
      if (targetId) {
        effects[targetId] = { ...(effects[targetId] || {}), turbo: true };
        updates.playerEffects = effects;
      }
      break;
    case 'force_truth':
      if (targetId) {
        effects[targetId] = { ...(effects[targetId] || {}), forceTruthLevel: 3 };
        updates.playerEffects = effects;
      }
      break;
    case 'silence':
      if (targetId) {
        effects[targetId] = { ...(effects[targetId] || {}), silence: true };
        updates.playerEffects = effects;
      }
      break;
    case 'life_shield':
      effects[pid] = { ...(effects[pid] || {}), immuneTurns: 2 };
      updates.playerEffects = effects;
      break;
    case 'choose_card':
      if (targetId) {
        updates.pendingCardType = { chooserId: pid, targetId, type: null };
      }
      break;
    case 'alliance':
      if (targetId) {
        effects[pid] = { ...(effects[pid] || {}), allianceWith: targetId };
        effects[targetId] = { ...(effects[targetId] || {}), allianceWith: pid };
        updates.playerEffects = effects;
      }
      break;
    default:
      break;
  }

  return updates;
}

function checkElimination(game, lives, playerId, updates) {
  if ((lives[playerId] ?? 0) > 0) return updates;

  /* Primera caída de cada jugador: se le ofrece volver con todas sus vidas. */
  const revanchaUsed = { ...(updates.revanchaUsed || game.revanchaUsed || {}) };
  if (!revanchaUsed[playerId] && getAlivePlayers(game.players, lives).length >= 1) {
    revanchaUsed[playerId] = true;
    updates.revanchaUsed = revanchaUsed;
    updates.revanchaState = { playerId, phase: 'offer', startedAt: Date.now(), expiresAt: Date.now() + RETURN_DECISION_MS };
    return updates;
  }

  const eliminated = [...(updates.eliminatedOrder || game.eliminatedOrder || [])];
  if (!eliminated.includes(playerId)) eliminated.push(playerId);
  updates.eliminatedOrder = eliminated;

  const winner = getWinnerId(game.players, lives);
  if (winner) updates.winnerId = winner;

  return updates;
}

export async function POST(req, { params }) {
  const { id } = await params;
  const gameId = id.toUpperCase();
  const body = await req.json();
  const game = getGame(gameId);
  if (!game) return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });

  if (body.action === 'join') {
    const result = joinGame(gameId, body.player);
    if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  }

  if (body.action === 'rejoin') {
    const player = game.players.find(p => p.id === body.playerId);
    if (!player) return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 });
    return NextResponse.json({ game, player });
  }

  const party = handleParty(game, body, { checkElimination });
  if (party) {
    if (party.error) return NextResponse.json({ error: party.error }, { status: 400 });
    const hasUpdates = Object.keys(party.updates || {}).length > 0;
    return NextResponse.json(hasUpdates ? updateGame(gameId, party.updates) : game);
  }

  if (body.action === 'update') {
    const updates = { ...body.updates };
    /* Al arrancar la partida: misiones secretas para todos */
    if (updates.status === 'playing' && game.status === 'lobby') {
      updates.missions = assignMissions(game.players);
    }
    const updated = updateGame(gameId, updates);
    return NextResponse.json(updated);
  }

  if (body.action === 'initTools') {
    if (Object.keys(game.playerTools || {}).length === 0 && game.players.length > 0) {
      const playerTools = {};
      game.players.forEach(p => { playerTools[p.id] = getRandomTools(TOOLS_AT_START); });
      return NextResponse.json(updateGame(gameId, { playerTools }));
    }
    return NextResponse.json(game);
  }

  if (body.action === 'useTool') {
    const { playerId: pid, tool, targetId } = body;
    const currentTools = JSON.parse(JSON.stringify(game.playerTools || {}));
    currentTools[pid] = (currentTools[pid] || []).filter(t => t.id !== tool.id);

    let updates = { playerTools: currentTools };
    updates = applyToolEffects(game, tool, pid, targetId, updates);

    /* Un cóctel puede dejar a alguien sin vidas: mismo trato que cualquier otra caída. */
    if (updates.playerLives) {
      for (const p of game.players) {
        const fell = (game.playerLives?.[p.id] ?? 0) > 0 && (updates.playerLives[p.id] ?? 0) <= 0;
        if (fell && !updates.revanchaState) updates = checkElimination(game, updates.playerLives, p.id, updates);
      }
    }

    const toastText = buildToastText(tool, playerName(game, pid), playerName(game, targetId));
    updates.lastToolEffect = {
      usedBy: pid,
      toolName: tool.name,
      toolEmoji: tool.emoji,
      effect: tool.effect,
      targetId: targetId || null,
      toastText,
      timestamp: Date.now(),
    };

    return NextResponse.json(updateGame(gameId, updates));
  }

  if (body.action === 'completeCard') {
    const { playerId: pid } = body;
    let lives = { ...game.playerLives };
    const effects = { ...(game.playerEffects || {}) };
    const alive = getAlivePlayers(game.players, lives).filter(p => p.id !== pid);
    const voteState = alive.length > 0 ? {
      targetId: pid,
      cardId: game.currentCard?.id,
      votes: {},
      startedAt: Date.now(),
      expiresAt: Date.now() + VOTE_DURATION_MS,
    } : null;

    return NextResponse.json(updateGame(gameId, {
      playerEffects: effects,
      playerLives: lives,
      voteState,
      lastCompletedCard: game.currentCard,
      stats: { ...game.stats, cardsPlayed: (game.stats?.cardsPlayed || 0) + 1 },
    }));
  }

  if (body.action === 'skipCard') {
    const { playerId: pid } = body;
    let lives = { ...game.playerLives };
    const effects = { ...(game.playerEffects || {}) };
    const myFx = effects[pid] || {};
    let penalty = 1;

    if (myFx.immuneTurns > 0) {
      effects[pid] = { ...myFx, immuneTurns: myFx.immuneTurns - 1 };
    } else if (myFx.freePass) {
      delete effects[pid].freePass;
      penalty = 0;
    } else {
      if (myFx.doublePenalty) {
        penalty = 2;
        delete effects[pid].doublePenalty;
      }
      lives = loseLife(lives, pid, penalty);
    }

    let updates = {
      playerLives: lives,
      playerEffects: effects,
      playerDareStreak: resetDareStreak(game.playerDareStreak || {}, pid),
      currentCard: null,
      stats: bump({ ...game.stats, skips: (game.stats?.skips || 0) + 1 }, pid, 'skips'),
      turnCount: (game.turnCount || 0) + 1,
    };
    updates = checkElimination(game, lives, pid, updates);
    updates = injectEvents(game, updates);

    const winner = updates.revanchaState ? null : getWinnerId(game.players, lives);
    if (winner) updates.winnerId = winner;

    const aliveAfter = getAlivePlayers(game.players, lives);
    if (!winner && !updates.revanchaState && aliveAfter.length > 0) {
      const pool = aliveAfter.filter(p => p.id !== game.currentTurnPlayerId);
      const next = (pool.length > 0 ? pool : aliveAfter)[Math.floor(Math.random() * (pool.length > 0 ? pool.length : aliveAfter.length))];
      const truthData = game.playerTruthData || {};
      const nextTruth = truthData[next.id] || { streak: 0, lockedTurns: 0 };
      updates.currentTurnPlayerId = next.id;
      updates.playerTruthData = {
        ...truthData,
        [next.id]: { ...nextTruth, lockedTurns: Math.max(0, nextTruth.lockedTurns - 1) },
      };
    }

    return NextResponse.json(updateGame(gameId, updates));
  }

  if (body.action === 'vote') {
    const { playerId: pid, vote } = body;
    const vs = game.voteState;
    if (!vs) return NextResponse.json(game);

    const votes = { ...vs.votes, [pid]: vote };
    const alive = getAlivePlayers(game.players, game.playerLives).filter(p => p.id !== vs.targetId);
    const allVoted = alive.every(p => votes[p.id]);

    if (!allVoted && Date.now() < vs.expiresAt) {
      return NextResponse.json(updateGame(gameId, { voteState: { ...vs, votes } }));
    }

    const noVotes = Object.values(votes).filter(v => v === 'no').length;
    const yesVotes = Object.values(votes).filter(v => v === 'yes').length;
    let lives = { ...game.playerLives };
    let updates = { voteState: null, currentCard: null };

    if (noVotes > yesVotes) {
      lives = loseLife(lives, vs.targetId, 1);
      updates.stats = { ...game.stats, votesFailed: (game.stats?.votesFailed || 0) + 1 };
      updates.playerDareStreak = resetDareStreak(game.playerDareStreak || {}, vs.targetId);
      updates = checkElimination(game, lives, vs.targetId, updates);
    } else if (game.currentCard?.type === 'dare') {
      const won = awardDareStreak(game.playerDareStreak || {}, game.playerTools || {}, vs.targetId);
      updates.playerDareStreak = won.streaks;
      if (won.reward) {
        updates.playerTools = won.tools;
        updates.lastToolEffect = {
          usedBy: vs.targetId,
          toolName: won.reward.name,
          toolEmoji: won.reward.emoji,
          effect: 'reward',
          targetId: null,
          toastText: `${playerName(game, vs.targetId)} cumplió ${DARE_STREAK_GOAL} retos seguidos y ganó ${won.reward.name}`,
          timestamp: Date.now(),
        };
      }
    }

    updates.playerLives = lives;
    updates.turnCount = (game.turnCount || 0) + 1;
    updates.currentCard = null;
    updates = injectEvents(game, updates);

    const aliveAfter = getAlivePlayers(game.players, lives);
    if (aliveAfter.length <= 1 && !updates.revanchaState) {
      updates.winnerId = aliveAfter[0]?.id || null;
      return NextResponse.json(updateGame(gameId, updates));
    }

    if (!updates.duelState && !updates.revanchaState) {
      const pool = aliveAfter.filter(p => p.id !== game.currentTurnPlayerId);
      const next = (pool.length > 0 ? pool : aliveAfter)[Math.floor(Math.random() * (pool.length > 0 ? pool.length : aliveAfter.length))];
      const truthData = game.playerTruthData || {};
      const nextTruth = truthData[next.id] || { streak: 0, lockedTurns: 0 };
      updates.currentTurnPlayerId = next.id;
      updates.playerTruthData = {
        ...truthData,
        [next.id]: { ...nextTruth, lockedTurns: Math.max(0, nextTruth.lockedTurns - 1) },
      };
    }

    if (updates.turnCount % DUEL_INTERVAL_TURNS === 0 && aliveAfter.length >= 2 && !updates.duelState) {
      const shuffled = [...aliveAfter].sort(() => Math.random() - 0.5);
      const p1 = shuffled[0];
      const p2 = shuffled[1];
      const card = getRandomCard(game.currentLevel, 'dare', game.players.map(p => p.name), p1.name, game.playedCards || []);
      updates.duelState = {
        player1Id: p1.id,
        player2Id: p2.id,
        card,
        votes: {},
        phase: 'active',
        startedAt: Date.now(),
        auto: true,
      };
    }

    return NextResponse.json(updateGame(gameId, updates));
  }

  if (body.action === 'duelVote') {
    const { playerId: pid, winnerId } = body;
    const ds = game.duelState;
    if (!ds) return NextResponse.json(game);

    const votes = { ...ds.votes, [pid]: winnerId };
    const voters = getAlivePlayers(game.players, game.playerLives).filter(
      p => p.id !== ds.player1Id && p.id !== ds.player2Id,
    );
    const allVoted = voters.length === 0 || voters.every(p => votes[p.id]);

    if (!allVoted) {
      return NextResponse.json(updateGame(gameId, { duelState: { ...ds, votes } }));
    }

    const p1Votes = Object.values(votes).filter(v => v === ds.player1Id).length;
    const p2Votes = Object.values(votes).filter(v => v === ds.player2Id).length;
    let loserId = ds.player2Id;
    if (p1Votes > p2Votes) loserId = ds.player2Id;
    else if (p2Votes > p1Votes) loserId = ds.player1Id;
    else loserId = Math.random() < 0.5 ? ds.player1Id : ds.player2Id;

    let lives = loseLife({ ...game.playerLives }, loserId, 1);
    let updates = { duelState: null, playerLives: lives };
    updates = checkElimination(game, lives, loserId, updates);

    const winner = updates.revanchaState ? null : getWinnerId(game.players, lives);
    if (winner) updates.winnerId = winner;

    return NextResponse.json(updateGame(gameId, updates));
  }

  if (body.action === 'returnChoice') {
    const rs = game.revanchaState;
    if (!rs) return NextResponse.json(game);
    const pid = rs.playerId;
    const lives = { ...game.playerLives };
    const updates = { revanchaState: null };
    const name = playerName(game, pid);

    if (body.accept) {
      lives[pid] = MAX_LIVES;
      updates.playerLives = lives;
    } else {
      const eliminated = [...(game.eliminatedOrder || [])];
      if (!eliminated.includes(pid)) eliminated.push(pid);
      updates.eliminatedOrder = eliminated;
      const winner = getWinnerId(game.players, lives);
      if (winner) updates.winnerId = winner;
    }
    updates.lastToolEffect = {
      usedBy: pid,
      toolName: 'Regreso',
      toolEmoji: body.accept ? 'heart' : 'moon',
      effect: body.accept ? 'return' : 'out',
      targetId: null,
      toastText: body.accept ? `${name} volvió al juego con ${MAX_LIVES} vidas` : `${name} se queda fuera de la partida`,
      timestamp: Date.now(),
    };

    /* Si la caída ocurrió en su turno, el turno pasa al siguiente. */
    if (!updates.winnerId && pid === game.currentTurnPlayerId) {
      const alive = getAlivePlayers(game.players, lives);
      const pool = alive.filter(p => p.id !== pid);
      const list = pool.length ? pool : alive;
      const next = list[Math.floor(Math.random() * list.length)];
      if (next) {
        const truthData = game.playerTruthData || {};
        const nextTruth = truthData[next.id] || { streak: 0, lockedTurns: 0 };
        updates.currentTurnPlayerId = next.id;
        updates.currentCard = null;
        updates.playerTruthData = { ...truthData, [next.id]: { ...nextTruth, lockedTurns: Math.max(0, nextTruth.lockedTurns - 1) } };
      }
    }

    return NextResponse.json(updateGame(gameId, updates));
  }

  if (body.action === 'nextTurn') {
    const alive = getAlivePlayers(game.players, game.playerLives);
    if (alive.length === 0) return NextResponse.json(game);

    const pool = alive.filter(p => p.id !== game.currentTurnPlayerId);
    const next = (pool.length > 0 ? pool : alive)[Math.floor(Math.random() * (pool.length > 0 ? pool.length : alive.length))];

    const truthData = game.playerTruthData || {};
    const nextTruth = truthData[next.id] || { streak: 0, lockedTurns: 0 };

    return NextResponse.json(updateGame(gameId, {
      currentTurnPlayerId: next.id,
      currentCard: null,
      playerTruthData: {
        ...truthData,
        [next.id]: { ...nextTruth, lockedTurns: Math.max(0, nextTruth.lockedTurns - 1) },
      },
    }));
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}