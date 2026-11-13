import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, getGame, updateGame, joinGame, getGames } from '@/lib/store';

beforeEach(() => {
  // Resetear el store entre pruebas
  globalThis.xtasisGames = {};
});

describe('createGame()', () => {
  it('crea un juego con id de 4 caracteres', () => {
    const game = createGame();
    expect(game.id).toHaveLength(4);
    expect(game.id).toMatch(/^[A-Z0-9]{4}$/);
  });

  it('el juego inicia en status lobby', () => {
    const game = createGame();
    expect(game.status).toBe('lobby');
  });

  it('el juego inicia sin jugadores', () => {
    const game = createGame();
    expect(game.players).toEqual([]);
  });

  it('el juego inicia en nivel 1', () => {
    const game = createGame();
    expect(game.currentLevel).toBe(1);
  });

  it('el juego inicia sin carta ni turno activo', () => {
    const game = createGame();
    expect(game.currentCard).toBeNull();
    expect(game.currentTurnPlayerId).toBeNull();
  });

  it('el juego inicia con playedCards vacío', () => {
    const game = createGame();
    expect(game.playedCards).toEqual([]);
  });

  it('el juego incluye timestamp updatedAt', () => {
    const before = Date.now();
    const game = createGame();
    expect(game.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('genera ids únicos en múltiples creaciones', () => {
    const ids = new Set();
    for (let i = 0; i < 10; i++) {
      ids.add(createGame().id);
    }
    expect(ids.size).toBe(10);
  });

  it('almacena el juego en el store global', () => {
    const game = createGame();
    expect(globalThis.xtasisGames[game.id]).toBeDefined();
  });
});

describe('getGame()', () => {
  it('devuelve el juego existente por id', () => {
    const game = createGame();
    expect(getGame(game.id)).toEqual(game);
  });

  it('devuelve null si el id no existe', () => {
    expect(getGame('XXXX')).toBeNull();
  });
});

describe('updateGame()', () => {
  it('actualiza campos del juego', () => {
    const game = createGame();
    const updated = updateGame(game.id, { status: 'playing' });
    expect(updated.status).toBe('playing');
  });

  it('preserva los campos no actualizados', () => {
    const game = createGame();
    const updated = updateGame(game.id, { currentLevel: 2 });
    expect(updated.id).toBe(game.id);
    expect(updated.players).toEqual([]);
  });

  it('actualiza el timestamp updatedAt', () => {
    const game = createGame();
    const before = Date.now();
    const updated = updateGame(game.id, { status: 'playing' });
    expect(updated.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('devuelve null si el juego no existe', () => {
    expect(updateGame('XXXX', { status: 'playing' })).toBeNull();
  });

  it('actualiza múltiples campos a la vez', () => {
    const game = createGame();
    const updated = updateGame(game.id, { status: 'playing', currentLevel: 3 });
    expect(updated.status).toBe('playing');
    expect(updated.currentLevel).toBe(3);
  });
});

describe('joinGame()', () => {
  it('agrega un jugador al juego', () => {
    const game = createGame();
    const result = joinGame(game.id, { name: 'Ana', avatar: '😎' });
    expect(result.game.players).toHaveLength(1);
    expect(result.player.name).toBe('Ana');
    expect(result.player.avatar).toBe('😎');
  });

  it('el primer jugador se convierte en host', () => {
    const game = createGame();
    const { player } = joinGame(game.id, { name: 'Carlos' });
    expect(player.isHost).toBe(true);
  });

  it('el segundo jugador NO es host', () => {
    const game = createGame();
    joinGame(game.id, { name: 'Ana' });
    const { player } = joinGame(game.id, { name: 'Luis' });
    expect(player.isHost).toBe(false);
  });

  it('asigna un id único al jugador', () => {
    const game = createGame();
    const { player } = joinGame(game.id, { name: 'Ana' });
    expect(player.id).toBeDefined();
    expect(typeof player.id).toBe('string');
  });

  it('rechaza nombre duplicado (case-insensitive)', () => {
    const game = createGame();
    joinGame(game.id, { name: 'Ana' });
    const result = joinGame(game.id, { name: 'ana' });
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/nombre/i);
  });

  it('usa avatar por defecto si no se provee', () => {
    const game = createGame();
    const { player } = joinGame(game.id, { name: 'Zoe' });
    expect(player.avatar).toBe('👽');
  });

  it('devuelve null si el juego no existe', () => {
    expect(joinGame('XXXX', { name: 'Ana' })).toBeNull();
  });

  it('actualiza updatedAt del juego al unirse', () => {
    const game = createGame();
    const before = Date.now();
    joinGame(game.id, { name: 'Ana' });
    expect(getGame(game.id).updatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe('getGames()', () => {
  it('devuelve todos los juegos del store', () => {
    const g1 = createGame();
    const g2 = createGame();
    const all = getGames();
    expect(all[g1.id]).toBeDefined();
    expect(all[g2.id]).toBeDefined();
  });

  it('devuelve objeto vacío cuando no hay juegos', () => {
    expect(getGames()).toEqual({});
  });
});
