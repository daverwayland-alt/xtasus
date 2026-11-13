import { MAX_LIVES } from './gameConstants';

export function initPlayerLives(players) {
  const lives = {};
  players.forEach(p => { lives[p.id] = MAX_LIVES; });
  return lives;
}

export function isAlive(lives, playerId) {
  return (lives[playerId] ?? 0) > 0;
}

export function getAlivePlayers(players, lives) {
  return players.filter(p => isAlive(lives, p.id));
}

export function loseLife(lives, playerId, amount = 1) {
  const current = lives[playerId] ?? 0;
  const next = Math.max(0, current - amount);
  return { ...lives, [playerId]: next };
}

export function gainLife(lives, playerId, amount = 1) {
  const current = lives[playerId] ?? 0;
  const next = Math.min(MAX_LIVES, current + amount);
  return { ...lives, [playerId]: next };
}

export function getWinnerId(players, lives) {
  const alive = getAlivePlayers(players, lives);
  return alive.length === 1 ? alive[0].id : null;
}