'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/* Estado en vivo de la sala: SSE con reconexión automática y polling de respaldo. */
export function useGameStream(gameId, { onGone } = {}) {
  const [game, setGame] = useState(null);
  const [live, setLive] = useState(false);
  const goneRef = useRef(onGone);
  useEffect(() => {
    goneRef.current = onGone;
  });

  const apply = useCallback(data => {
    setGame(prev => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
  }, []);

  useEffect(() => {
    let closed = false;
    let es = null;
    let pollTimer = null;
    let retry = null;

    /* Un 404 suelto no significa que la sala murió (varias instancias, reinicios, red móvil):
       solo se da por perdida tras varios 404 seguidos. */
    let misses = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/game/${gameId}`, { cache: 'no-store' });
        if (res.status === 404) {
          if (++misses >= 5 && !closed) goneRef.current?.();
          return;
        }
        if (res.ok && !closed) {
          misses = 0;
          apply(await res.json());
        }
      } catch {}
    };

    const startPolling = () => {
      if (pollTimer) return;
      poll();
      pollTimer = setInterval(poll, 1500);
    };
    const stopPolling = () => {
      clearInterval(pollTimer);
      pollTimer = null;
    };

    const connect = () => {
      if (closed || typeof EventSource === 'undefined') return startPolling();
      es = new EventSource(`/api/game/${gameId}/stream`);
      es.onopen = () => {
        setLive(true);
        stopPolling();
      };
      es.onmessage = e => {
        try {
          apply(JSON.parse(e.data));
        } catch {}
      };
      es.onerror = () => {
        setLive(false);
        es?.close();
        startPolling();
        retry = setTimeout(connect, 4000);
      };
    };

    poll(); // primer estado inmediato, sin esperar al stream
    connect();

    return () => {
      closed = true;
      es?.close();
      stopPolling();
      clearTimeout(retry);
    };
  }, [gameId, apply]);

  /* Aplicar respuesta de un POST al instante (optimista) */
  const push = useCallback(data => data && apply(data), [apply]);

  return { game, live, push };
}

/* POST helper para acciones del juego */
export async function act(gameId, body) {
  try {
    const res = await fetch(`/api/game/${gameId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return null;
  }
}
