'use client';

/* Sesión persistente: permite reconectar a la sala si se cierra la pestaña o se bloquea el celular. */
const KEY = 'xtasis_session';

export function saveSession({ gameId, playerId, isHost, name }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ gameId, playerId, isHost: !!isHost, name, at: Date.now() }));
    sessionStorage.setItem('playerId', playerId);
    sessionStorage.setItem('isHost', isHost ? 'true' : 'false');
    if (name) sessionStorage.setItem('playerName', name);
  } catch {}
}

export function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || Date.now() - s.at > 6 * 60 * 60 * 1000) return null;
    return s;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('isHost');
    sessionStorage.removeItem('playerName');
  } catch {}
}

/* Identidad vigente para la sala actual (sessionStorage primero, luego localStorage). */
export function currentIdentity(gameId) {
  try {
    const pid = sessionStorage.getItem('playerId');
    if (pid) return { playerId: pid, isHost: sessionStorage.getItem('isHost') === 'true' };
    const s = loadSession();
    if (s && s.gameId === gameId) {
      sessionStorage.setItem('playerId', s.playerId);
      sessionStorage.setItem('isHost', s.isHost ? 'true' : 'false');
      return { playerId: s.playerId, isHost: s.isHost };
    }
  } catch {}
  return { playerId: '', isHost: false };
}
