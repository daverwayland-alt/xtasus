/*
  Cócteles de la barra. Cada jugador empieza con TOOLS_AT_START y gana uno más
  por cada DARE_STREAK_GOAL retos seguidos (sin tope). `emoji` es un id de
  `data/symbols.js` (lo pinta <PlayerSymbol>). Todos los `effect` están
  implementados en `api/game/[id]/route.js` y en `offline/page.js`:

  gain_life · heal_life · curse_life · free_pass · double_penalty · life_shield
  steal_tool · gift_tool · amnesia · swap_turn · force_duel · revive
*/

export const TOOLS_AT_START = 3;
export const DARE_STREAK_GOAL = 3;

export const TOOLS = [
  /* ── Vidas ── */
  {
    id: 'spritz_rose',
    name: 'Spritz Rosé',
    emoji: 'flower',
    description: 'Recuperas 1 vida',
    requiresTarget: false,
    effect: 'gain_life',
    toastTemplate: '{user} bebió un Spritz Rosé y recuperó 1 vida',
  },
  {
    id: 'elixir_carmin',
    name: 'Elixir Carmín',
    emoji: 'heart',
    description: 'Recuperas 1 vida',
    requiresTarget: false,
    effect: 'gain_life',
    toastTemplate: '{user} bebió un Elixir Carmín y recuperó 1 vida',
  },
  {
    id: 'copa_cortesia',
    name: 'Copa de cortesía',
    emoji: 'gem',
    description: 'Regalas 1 vida a quien elijas',
    requiresTarget: true,
    effect: 'heal_life',
    toastTemplate: '{user} le invitó una copa a {target} — +1 vida',
  },
  {
    id: 'brindis_generoso',
    name: 'Brindis generoso',
    emoji: 'sun',
    description: 'Regalas 1 vida a quien elijas',
    requiresTarget: true,
    effect: 'heal_life',
    toastTemplate: '{user} brindó por {target} — +1 vida',
  },
  {
    id: 'negroni_amargo',
    name: 'Negroni amargo',
    emoji: 'flame',
    description: 'Quien elijas pierde 1 vida',
    requiresTarget: true,
    effect: 'curse_life',
    toastTemplate: '{user} le sirvió un Negroni amargo a {target} — pierde 1 vida',
  },
  {
    id: 'absenta_verde',
    name: 'Absenta verde',
    emoji: 'bolt',
    description: 'Quien elijas pierde 1 vida',
    requiresTarget: true,
    effect: 'curse_life',
    toastTemplate: '{user} le dio absenta a {target} — pierde 1 vida',
  },

  /* ── Pases y escudos ── */
  {
    id: 'old_fashioned',
    name: 'Old Fashioned',
    emoji: 'crown',
    description: 'Tu próximo reto saltado no cuesta vida',
    requiresTarget: false,
    effect: 'free_pass',
    toastTemplate: '{user} pidió un Old Fashioned — su próximo salto es gratis',
  },
  {
    id: 'martini_seco',
    name: 'Martini seco',
    emoji: 'diamond',
    description: 'Tu próximo reto saltado no cuesta vida',
    requiresTarget: false,
    effect: 'free_pass',
    toastTemplate: '{user} pidió un Martini seco — su próximo salto es gratis',
  },
  {
    id: 'gimlet_helado',
    name: 'Gimlet helado',
    emoji: 'moon',
    description: 'Tu próximo reto saltado no cuesta vida',
    requiresTarget: false,
    effect: 'free_pass',
    toastTemplate: '{user} pidió un Gimlet helado — su próximo salto es gratis',
  },
  {
    id: 'vino_reserva',
    name: 'Vino reserva',
    emoji: 'shield',
    description: 'Blindaje: tus próximos 2 saltos no cuestan vida',
    requiresTarget: false,
    effect: 'life_shield',
    toastTemplate: '{user} descorchó un Vino reserva — protegido por 2 saltos',
  },
  {
    id: 'cava_gran_reserva',
    name: 'Cava gran reserva',
    emoji: 'star',
    description: 'Blindaje: tus próximos 2 saltos no cuestan vida',
    requiresTarget: false,
    effect: 'life_shield',
    toastTemplate: '{user} abrió un Cava gran reserva — protegido por 2 saltos',
  },

  /* ── Castigos ── */
  {
    id: 'whisky_doble',
    name: 'Whisky doble',
    emoji: 'flame',
    description: 'Si quien elijas salta un reto, pierde 2 vidas',
    requiresTarget: true,
    effect: 'double_penalty',
    toastTemplate: '{user} le pidió un Whisky doble a {target} — su próximo salto cuesta doble',
  },
  {
    id: 'mezcal_doble',
    name: 'Mezcal doble',
    emoji: 'bolt',
    description: 'Si quien elijas salta un reto, pierde 2 vidas',
    requiresTarget: true,
    effect: 'double_penalty',
    toastTemplate: '{user} le sirvió un Mezcal doble a {target} — su próximo salto cuesta doble',
  },
  {
    id: 'duelo_bourbon',
    name: 'Duelo de bourbon',
    emoji: 'orbit',
    description: 'Retas a duelo a quien elijas',
    requiresTarget: true,
    effect: 'force_duel',
    toastTemplate: '{user} retó a {target} a un duelo de bourbon',
  },
  {
    id: 'shot_de_honor',
    name: 'Shot de honor',
    emoji: 'infinity',
    description: 'Retas a duelo a quien elijas',
    requiresTarget: true,
    effect: 'force_duel',
    toastTemplate: '{user} le exigió un shot de honor a {target} — ¡duelo!',
  },

  /* ── Barra y turnos ── */
  {
    id: 'manhattan_prestado',
    name: 'Manhattan prestado',
    emoji: 'eye',
    description: 'Robas un cóctel al azar a quien elijas',
    requiresTarget: true,
    effect: 'steal_tool',
    toastTemplate: '{user} le robó un cóctel a {target}',
  },
  {
    id: 'sour_ladron',
    name: 'Sour ladrón',
    emoji: 'fingerprint',
    description: 'Robas un cóctel al azar a quien elijas',
    requiresTarget: true,
    effect: 'steal_tool',
    toastTemplate: '{user} le quitó un cóctel a {target}',
  },
  {
    id: 'ronda_casa',
    name: 'Ronda de la casa',
    emoji: 'spark',
    description: 'Regalas un cóctel al azar a quien elijas',
    requiresTarget: true,
    effect: 'gift_tool',
    toastTemplate: '{user} le mandó una ronda de la casa a {target}',
  },
  {
    id: 'mojito_cortesia',
    name: 'Mojito de cortesía',
    emoji: 'feather',
    description: 'Regalas un cóctel al azar a quien elijas',
    requiresTarget: true,
    effect: 'gift_tool',
    toastTemplate: '{user} le invitó un mojito a {target} — llegó un cóctel a su barra',
  },
  {
    id: 'daiquiri_olvido',
    name: 'Daiquiri del olvido',
    emoji: 'waves',
    description: 'La mesa olvida las cartas jugadas: el mazo se reinicia',
    requiresTarget: false,
    effect: 'amnesia',
    toastTemplate: '{user} pidió un Daiquiri del olvido — el mazo se reinició',
  },
  /* ── Cartas poder: hacen volver a un eliminado con todas sus vidas ── */
  {
    id: 'corpse_reviver_1',
    name: 'Corpse Reviver Nº 1',
    emoji: 'orbit',
    description: 'Haces volver al juego, con 3 vidas, a quien ya cayó',
    requiresTarget: true,
    effect: 'revive',
    toastTemplate: '{user} sirvió un Corpse Reviver y {target} vuelve al juego con 3 vidas',
  },
  {
    id: 'corpse_reviver_2',
    name: 'Corpse Reviver Nº 2',
    emoji: 'sun',
    description: 'Haces volver al juego, con 3 vidas, a quien ya cayó',
    requiresTarget: true,
    effect: 'revive',
    toastTemplate: '{user} resucitó a {target} — vuelve con 3 vidas',
  },
  {
    id: 'cosmopolitan',
    name: 'Cosmopolitan',
    emoji: 'smile',
    description: 'Le cedes tu turno a quien elijas',
    requiresTarget: true,
    effect: 'swap_turn',
    toastTemplate: '{user} le cedió el turno a {target}',
  },
  {
    id: 'brindis_cruzado',
    name: 'Brindis cruzado',
    emoji: 'focus',
    description: 'Le cedes tu turno a quien elijas',
    requiresTarget: true,
    effect: 'swap_turn',
    toastTemplate: '{user} hizo un brindis cruzado: ahora le toca a {target}',
  },
];

export function getRandomTools(count = 1) {
  const shuffled = [...TOOLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, TOOLS.length));
}

/* Un cóctel al azar con un id único, para poder acumular copias sin choques de `key`. */
export function drawTool() {
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  return { ...tool, id: `${tool.id}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
}

export function buildToastText(tool, userName, targetName = '') {
  return (tool.toastTemplate || `${userName} usó ${tool.name}`).replace(/\{user\}/g, userName).replace(/\{target\}/g, targetName || '???');
}
