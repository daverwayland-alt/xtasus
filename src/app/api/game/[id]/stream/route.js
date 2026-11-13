import { getGame, subscribe } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* SSE: empuja el estado completo de la sala en cada cambio (sin polling).
   El cliente cae a polling automáticamente si la conexión se corta. */
export async function GET(req, { params }) {
  const { id } = await params;
  const gameId = id.toUpperCase();
  if (!getGame(gameId)) return new Response('Juego no encontrado', { status: 404 });

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat;

  const stream = new ReadableStream({
    start(controller) {
      const send = game => controller.enqueue(encoder.encode(`data: ${JSON.stringify(game)}\n\n`));
      const cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };

      send(getGame(gameId));
      unsubscribe = subscribe(gameId, send);
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          cleanup();
        }
      }, 15000);

      req.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
