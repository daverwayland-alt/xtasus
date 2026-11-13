// Simple in-memory store for development
// Using globalThis prevents object resetting during Next.js Hot Module Replacement
const globalStore = globalThis || global;

if (!globalStore.xtasisGames) {
  globalStore.xtasisGames = {};
}

export const getGames = () => globalStore.xtasisGames;

export const createGame = () => {
    // Generate a simple 4-character room code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure unique ID
    while (globalStore.xtasisGames[id]) {
        id = '';
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }

    const state = {
        id,
        status: "lobby", // 'lobby' | 'playing'
        players: [], // { id, name, avatar, isHost }
        currentLevel: 1, // Only maps to levels 1, 2, 3 now
        unlockedDrinkity: false,
        currentTurnPlayerId: null,
        currentCard: null, // { ...cardConfig }
        playedCards: [],   // Array to track played card IDs
        updatedAt: Date.now()
    };

    globalStore.xtasisGames[id] = state;
    return state;
};

export const getGame = (id) => {
    return globalStore.xtasisGames[id] || null;
};

export const updateGame = (id, updates) => {
    if (globalStore.xtasisGames[id]) {
        globalStore.xtasisGames[id] = {
            ...globalStore.xtasisGames[id],
            ...updates,
            updatedAt: Date.now()
        };
        return globalStore.xtasisGames[id];
    }
    return null;
};

export const joinGame = (gameId, player) => {
    const game = getGame(gameId);
    if (!game) return null;
    
    // Check if player name exists
    const existing = game.players.find(p => p.name.toLowerCase() === player.name.toLowerCase());
    if (existing) {
        return { error: 'El nombre ya está en uso en esta sala.' };
    }

    const newPlayer = {
        id: crypto.randomUUID(),
        name: player.name,
        avatar: player.avatar || '👽',
        isHost: game.players.length === 0
    };

    game.players.push(newPlayer);
    game.updatedAt = Date.now();
    return { game, player: newPlayer };
};
