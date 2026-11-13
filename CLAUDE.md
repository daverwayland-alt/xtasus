# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Estado del proyecto

Versión 3.0 — "Velvet Night": rediseño visual completo (negro, carmín y rojos; serif de moda; lujo y sensualidad), SSE en tiempo real y modos de fiesta. Ver historial de commits para contexto.

## Comandos principales

```bash
bun run dev      # Servidor de desarrollo (http://localhost:3000)
bun run build    # Build de producción
bun run start    # Iniciar servidor de producción
bun run lint     # ESLint
```

> **Nota de despliegue:** El store es in-memory (`globalThis`). No usar Vercel (serverless reinicia el estado). Requiere un servidor Node.js persistente (Railway, Render.com).

## Arquitectura

### Flujo de una partida

```
Home (page.js)
  → crea partida (POST /api/game) → room code de 4 chars
  → Lobby (/lobby/[id]) → jugadores se unen, host inicia
  → Game (/game/[id])   → turnos, cartas, niveles
```

Cada ruta dinámica tiene un Server Component wrapper (`page.js`) que solo renderiza el Client Component correspondiente (`LobbyClient.js` / `GameClient.js`). Toda la lógica vive en los Client Components.

### Sincronización en tiempo real

**SSE** (`GET /api/game/[id]/stream`) empuja el estado completo de la sala en cada cambio; el store (`src/lib/store.js`) tiene `subscribe`/`notify` y `updateGame` notifica. El hook `useGameStream` (`src/hooks/useGameStream.js`) abre el `EventSource`, y si se corta cae a polling de 1.5 s y reintenta. Las acciones del jugador son `POST /api/game/[id]` (helper `act()` del mismo hook). Sigue sin WebSockets.

### Estado del juego (`src/lib/store.js`)

Store singleton en `globalThis` que sobrevive HMR. Forma del objeto:

```js
{
  (id,
    status,
    players,
    currentLevel, // 1 | 2 | 3
    currentTurnPlayerId,
    currentCard, // { id, type, level, text }
    playedCards, // Set de ids para anti-repetición
    updatedAt);
}
```

Funciones exportadas: `createGame`, `getGame`, `updateGame`, `joinGame`.

### API Routes (`src/app/api/game/`)

| Método | Ruta             | Acción                                          |
| ------ | ---------------- | ----------------------------------------------- |
| POST   | `/api/game`      | Crear partida                                   |
| GET    | `/api/game/[id]` | Obtener estado                                  |
| GET    | `/api/game/[id]/stream` | SSE con el estado completo en cada cambio |
| POST   | `/api/game/[id]` | `join`, `rejoin`, `update`, `useTool`, `completeCard`, `skipCard`, `vote`, `duelVote`, `nextTurn`… y las acciones de fiesta de `src/lib/party.js` (`react`, `drink`, `submitConfession`, `addRule`, `startMlt`/`mltVote`, `startNhie`/`nhieAnswer`, `startBomb`/`bombPass`/`bombCheck`, `partyClose`, `triggerChaos`, `waterAck`, `missionDone`, `setPartyOptions`) |

### Sistema de cartas (`src/data/cards.js`)

- 450+ cartas divididas en 3 niveles: **Pre-Copa** (1), **Seducción** (2), **Xtasis** (3).
- Tipos: `truth` | `dare`.
- Los textos usan placeholders `{player1}`, `{player2}`, `{player3}` que se reemplazan en runtime con nombres reales.
- `getRandomCard(level, playedIds, players)` garantiza anti-repetición filtrando los ids ya jugados.

### Convenciones de UI

- Sistema visual "Velvet Night" en `globals.css` (ver sección de diseño). **DaisyUI ya no se usa.**
- Primitivas reutilizables en `src/components/kit/` (`Btn`, `Sheet` basado en vaul, `Switch`, `Avatar`/`Pips`, `Marquee`, `Cheers`, `ScrambleText`, `Ticker`). Componentes de partida en `src/components/Game/`. **Windows no distingue `UI` de `ui`: no crear carpetas que solo difieran en mayúsculas.**
- `cn()` en `src/lib/utils.js` combina `clsx` + `tailwind-merge` — usar siempre para clases Tailwind condicionales.
- Sonido (WebAudio) y vibración en `src/lib/feedback.js` (`feel('pop','medium')`); preferencias en `src/lib/settings.js`; sesión reconectable en `src/lib/session.js`.
- React Compiler está activo: no leer `x.id` de valores posiblemente `undefined` durante el render (usar un placeholder), y no declarar callbacks después de los efectos que los usan.

### Alias de importación

```js
import { cn } from '@/lib/utils'; // @ → src/
```

## Sistema de diseño (v3 — "Velvet Night")

Dirección: **sensualidad, elegancia y lujo**. Negro lacado, carmín y rojos profundos, marfil cálido para el texto. **Nada de neón ni pasteles brillantes**; el rojo se usa como acento y panel oscuro, no en todo. Movimiento lento y deliberado. Tipografía: Bodoni Moda (títulos, serif de moda), Jost (texto) y JetBrains Mono (datos).

Todo vive en `src/app/globals.css`. Clases principales:

| Clase                                           | Propósito                                                       |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `btn`, `btn-acid/cyan/pink/violet/orange`, `btn-ghost/outline`, `btn-xl/sm/full/icon` | Botones lacados (usar `<Btn>` de `kit/`) |
| `input`, `code-input`, `chip`, `chip-on`, `sticker*`, `eyebrow` | Formularios, etiquetas                           |
| `panel`, `panel-2`, `panel-accent`, `tile`, `bento`, `span-*`   | Superficies de terciopelo con doble filete y rejilla bento      |
| `avatar`, `avatar-sm/md/lg/xl/active/dead`, `pips`              | Jugadores y vidas                                               |
| `playcard`, `playcard-truth/dare/golden/random`                 | Carta holográfica con borde cónico animado                      |
| `hud`, `dock`, `overlay`, `sheet`, `drawer-*`, `toast-pill`     | Estructura del juego                                            |
| `tape`, `title-brand`, `room-code`, `gold-text`, `rainbow-text` | Cinta, cabecera de revista, código de sala                      |
| `site-bg`, `bubble`, `grain`, `scanlines`, `cursor-glow`        | Fondo vivo (burbujas, abanico art déco)                         |

**Color por nivel:** `body[data-game-level='1|2|3']` redefine `--accent`, `--accent-2`, `--accent-ink` y `--accent-glow` (1 rosé/cereza, 2 carmín, 3 escarlata). `secret-active` los lleva a rojo sangre. Los nombres `--acid/--cyan/--pink/--violet/--orange/--gold` son alias heredados que apuntan a la paleta roja actual; preferir `--accent*`, `--ruby`, `--champagne`, `--paper`, `--muted`, `--ink*`.

## Funcionalidades (v3)

Mecánicas de partida (vidas, duelos, carta dorada, modo relámpago) se mantienen. Cambios de reglas:

- **Cócteles** (`src/data/tools.js`): cada jugador empieza con 3; cada 3 retos cumplidos seguidos gana 1 al azar, sin tope (`src/lib/rewards.js`). Todo `effect` del catálogo debe estar implementado en `api/game/[id]/route.js` y en `offline/page.js`.
- **Regreso**: la primera vez que alguien se queda sin vidas, un modal le pregunta si vuelve con 3 vidas; si no, la partida sigue sin él (`returnChoice`, `revanchaState.phase === 'offer'`). Las dos cartas poder `revive` (Corpse Reviver) hacen volver, sin preguntar, a quien el dueño elija.

Novedades:

1. **Tiempo real por SSE** con reconexión y respaldo a polling.
2. **Ruleta radial SVG** (`TurnWheel`) con inercia y "tick" por segmento.
3. **¿Quién es más probable?**, **Yo nunca** y **Papa caliente** (mecha secreta resuelta en servidor) — `Game/PartyModes.jsx`, contenido en `src/data/party.js`.
4. **Leyes de la mesa**, **eventos de caos** (cada 7 turnos), **pausas de agua** (cada 11), **misiones secretas** ("mantén para ver").
5. **Confesionario anónimo** en el lobby (cartas al mazo sin firma) y **reacciones en vivo** para todos.
6. **Contador de tragos compartido** y **premios de la noche** con tarjeta compartible (canvas) en `Game/Recap.jsx`.
7. **Lobby con QR**, compartir enlace, **reconexión** tras refrescar (`xtasis_session`), Wake Lock y manifest PWA.
8. **Sonido y háptica** sintetizados, narrador por voz opcional.
9. **Modo Secreto** — tocar el logo 5× en la Home activa `xtasis_secret=true` (tema rojo sangre, nivel 3).
10. **Modo Offline** (`/offline`) — un solo celular, estado 100 % local. Incluye leyes, caos, agua, tragos, "quién es más probable"/"yo nunca" y papa caliente locales; **no** tiene misiones, reacciones ni confesionario.
