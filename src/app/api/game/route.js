import { NextResponse } from 'next/server';
import { createGame } from '@/lib/store';

/**
 * --------------------------------- CONTROL -----------------------------------
 * crea un juego y devuelve un JSON respuesta con los datos del juego o un
 * mensaje de error.
 *
 * @param req: Esta función parece maneja un Solicitud POST para crear un nuevo
 * juego.
 *
 * @returns Una respuesta JSON que contiene el objeto de juego recién creado con
 * un código de estado de 201 si el La creación del juego es exitosa.
 * ------------------------------------------------------------------------------*/

export async function POST(req) {
  try {
    const game = createGame();
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
