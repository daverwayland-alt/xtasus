export const PLAYER_SYMBOLS = [
  { id: 'spark', label: 'Destello', glyph: '✦' }, { id: 'heart', label: 'Corazón', glyph: '♡' },
  { id: 'flame', label: 'Fuego', glyph: '△' }, { id: 'moon', label: 'Luna', glyph: '☾' },
  { id: 'crown', label: 'Corona', glyph: '♔' }, { id: 'gem', label: 'Diamante', glyph: '◇' },
  { id: 'bolt', label: 'Rayo', glyph: 'ϟ' }, { id: 'orbit', label: 'Órbita', glyph: '◎' },
  { id: 'flower', label: 'Flor', glyph: '✿' }, { id: 'eye', label: 'Mirada', glyph: '◉' },
  { id: 'infinity', label: 'Infinito', glyph: '∞' }, { id: 'star', label: 'Estrella', glyph: '☆' },
  { id: 'shield', label: 'Escudo', glyph: '◈' }, { id: 'feather', label: 'Pluma', glyph: '⌁' },
  { id: 'fingerprint', label: 'Huella', glyph: '◌' }, { id: 'smile', label: 'Sonrisa', glyph: '⌣' },
  { id: 'diamond', label: 'Prisma', glyph: '♦' }, { id: 'focus', label: 'Enfoque', glyph: '⊙' },
  { id: 'sun', label: 'Sol', glyph: '☼' }, { id: 'waves', label: 'Ondas', glyph: '≈' },
];

// Rooms created before the visual update keep their identities and get the new art.
const LEGACY = { '🍸': 'spark', '🥂': 'heart', '🍷': 'flame', '🍾': 'moon', '🍹': 'crown', '🥃': 'gem', '🍺': 'bolt', '🍻': 'heart', '🍒': 'flower', '🌹': 'flower', '💋': 'heart', '🔥': 'flame', '🖤': 'heart', '💎': 'gem', '👑': 'crown', '🌙': 'moon', '✨': 'spark', '🦋': 'feather', '🐍': 'waves', '🕯️': 'sun', '🎭': 'focus', '😈': 'smile' };
export function symbolId(value) { return LEGACY[value] || value; }
export function symbolLabel(value) { return PLAYER_SYMBOLS.find(s => s.id === symbolId(value))?.label || 'Símbolo'; }
export function symbolGlyph(value) { return PLAYER_SYMBOLS.find(s => s.id === symbolId(value))?.glyph || '✦'; }
