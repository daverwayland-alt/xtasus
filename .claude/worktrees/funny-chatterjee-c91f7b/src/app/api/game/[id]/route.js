import { NextResponse } from 'next/server';
import { getGame, updateGame, joinGame } from '@/lib/store';

/**
 * -------------------------- GET SESION GAME BY ID ----------------------------
 *
 * Esta función recupera una Secion del juego según la ID proporcionada y lo
 * devuelve como una respuesta JSON,
 *
 * @param req: el parámetro `req` normalmente representa el request entrante
 *
 * @returns El código devuelve una respuesta JSON con los datos del juego si se
 * encuentra el juego.
 *
 * -----------------------------------------------------------------------------
 */

export async function GET(req, { params }) {
  const { id } = await params;
  const gameId = id.toUpperCase();

  const game = getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
  }

  return NextResponse.json(game);
}

/**
 * -------------------------------- JOIN GAME ----------------------------------
 * permite a los jugadores unirse a un juego o actualizar su estado basado en la
 * acción proporcionada en el cuerpo de la solicitud.
 *
 * @param req: utiliza `req.json()` para analizar el cuerpo JSON de la
 * solicitud.
 *
 * @returns El fragmento de código proporcionado es una función de controlador
 * de solicitudes POST que procesa solicitudes a únete o actualiza el juego.
 * -----------------------------------------------------------------------------
 */

export async function POST(req, { params }) {
  const { id } = await params;
  const gameId = id.toUpperCase();
  const body = await req.json();

  const game = getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
  }

  // Action: join
  if (body.action === 'join') {
    const result = joinGame(gameId, body.player);
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  // Action: update state (level, start game, next turn etc)
  if (body.action === 'update') {
    const updated = updateGame(gameId, body.updates);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
