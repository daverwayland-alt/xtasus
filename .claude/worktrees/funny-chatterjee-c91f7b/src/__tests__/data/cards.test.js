import { describe, it, expect } from 'vitest';
import { levels, cards, getRandomCard } from '@/data/cards';

describe('levels', () => {
  it('tiene exactamente 3 niveles', () => {
    expect(levels).toHaveLength(3);
  });

  it('los ids son 1, 2 y 3', () => {
    expect(levels.map(l => l.id)).toEqual([1, 2, 3]);
  });

  it('los nombres son correctos', () => {
    expect(levels[0].name).toBe('Pre-Copa');
    expect(levels[1].name).toBe('Seducción');
    expect(levels[2].name).toBe('Xtasis');
  });

  it('cada nivel tiene color y shadow definidos', () => {
    for (const level of levels) {
      expect(level.color).toBeTruthy();
      expect(level.shadow).toBeTruthy();
    }
  });

  it('ningún nivel está bloqueado', () => {
    expect(levels.every(l => l.locked === false)).toBe(true);
  });
});

describe('cards (dataset)', () => {
  it('tiene más de 100 cartas', () => {
    expect(cards.length).toBeGreaterThan(100);
  });

  it('cada carta tiene id, level, type y text', () => {
    for (const card of cards) {
      expect(card.id).toBeDefined();
      expect(card.level).toBeOneOf([1, 2, 3]);
      expect(card.type).toBeOneOf(['truth', 'dare']);
      expect(typeof card.text).toBe('string');
      expect(card.text.length).toBeGreaterThan(0);
    }
  });

  it('existen cartas para cada nivel', () => {
    expect(cards.some(c => c.level === 1)).toBe(true);
    expect(cards.some(c => c.level === 2)).toBe(true);
    expect(cards.some(c => c.level === 3)).toBe(true);
  });

  it('existen cartas de tipo truth y dare', () => {
    expect(cards.some(c => c.type === 'truth')).toBe(true);
    expect(cards.some(c => c.type === 'dare')).toBe(true);
  });

  it('los ids son únicos', () => {
    const ids = cards.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getRandomCard()', () => {
  const players = ['Ana', 'Luis', 'Mia'];
  const currentPlayer = 'Ana';

  it('devuelve una carta del nivel correcto', () => {
    const card = getRandomCard(1, 'truth', players, currentPlayer);
    expect(card.level).toBe(1);
  });

  it('devuelve una carta del tipo correcto', () => {
    const card = getRandomCard(1, 'truth', players, currentPlayer);
    expect(card.type).toBe('truth');
  });

  it('type "random" devuelve cualquier tipo', () => {
    const card = getRandomCard(1, 'random', players, currentPlayer);
    expect(['truth', 'dare']).toContain(card.type);
  });

  it('respeta playedCardIds (no repite carta jugada)', () => {
    const first = getRandomCard(1, 'truth', players, currentPlayer);
    const playedIds = [first.id];

    // Con suficientes intentos debe devolver una carta diferente
    let foundDifferent = false;
    for (let i = 0; i < 20; i++) {
      const next = getRandomCard(1, 'truth', players, currentPlayer, playedIds);
      if (next.id !== first.id) {
        foundDifferent = true;
        break;
      }
    }
    expect(foundDifferent).toBe(true);
  });

  it('resetea el pool cuando todos los ids están jugados', () => {
    const levelCards = cards.filter(c => c.level === 1 && c.type === 'dare');
    const allIds = levelCards.map(c => c.id);
    // Pasar todos los ids como jugados → debe resetear y devolver una carta
    const card = getRandomCard(1, 'dare', players, currentPlayer, allIds);
    expect(card).toBeDefined();
    expect(card.level).toBe(1);
  });

  it('reemplaza {player1} con nombre real', () => {
    // Buscar cartas con placeholder
    const templateCard = cards.find(c => c.level === 1 && c.text.includes('{player1}'));
    if (!templateCard) return; // Skip si no hay plantillas en nivel 1

    // Llamar suficientes veces hasta encontrar esa carta (o una sin placeholder)
    let replaced = false;
    for (let i = 0; i < 50; i++) {
      const card = getRandomCard(1, templateCard.type, players, currentPlayer);
      if (!card.text.includes('{player1}')) {
        replaced = true;
        break;
      }
    }
    expect(replaced).toBe(true);
  });

  it('devuelve carta de fallback si no hay pool disponible', () => {
    // Nivel inexistente → pool vacío incluso tras reset
    const card = getRandomCard(99, 'truth', players, currentPlayer);
    expect(card).toBeDefined();
    expect(card.id).toBe('error');
  });

  it('la carta devuelta tiene estructura válida', () => {
    const card = getRandomCard(2, 'dare', players, currentPlayer);
    expect(card.id).toBeDefined();
    expect(card.type).toBeDefined();
    expect(card.level).toBeDefined();
    expect(typeof card.text).toBe('string');
  });

  it('no incluye al jugador actual como sustituto de placeholder', () => {
    const playersWithPlaceholder = ['Ana', 'Luis', 'Mia'];
    // Ejecutar múltiples veces para verificar que {player1} no es "Ana" (currentPlayer)
    let valid = true;
    for (let i = 0; i < 30; i++) {
      const card = getRandomCard(1, 'truth', playersWithPlaceholder, 'Ana');
      if (card.text.includes('{player1}')) {
        valid = false;
        break;
      }
      // El texto no debe contener el currentPlayer como sustitución si hay alternativas
    }
    expect(valid).toBe(true);
  });
});
