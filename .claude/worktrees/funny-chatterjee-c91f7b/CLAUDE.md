# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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

Se usa **long polling** (intervalo de 1.5 s) en lugar de WebSockets. Tanto `LobbyClient` como `GameClient` hacen `GET /api/game/[id]` periódicamente y actualizan estado local.

### Estado del juego (`src/lib/store.js`)

Store singleton en `globalThis` que sobrevive HMR. Forma del objeto:

```js
{
  id, status, players,
  currentLevel,          // 1 | 2 | 3
  currentTurnPlayerId,
  currentCard,           // { id, type, level, text }
  playedCards,           // Set de ids para anti-repetición
  updatedAt
}
```

Funciones exportadas: `createGame`, `getGame`, `updateGame`, `joinGame`.

### API Routes (`src/app/api/game/`)

| Método | Ruta | Acción |
|--------|------|--------|
| POST | `/api/game` | Crear partida |
| GET | `/api/game/[id]` | Obtener estado |
| POST | `/api/game/[id]` | `join` (unirse) o `update` (sincronizar estado) |

### Sistema de cartas (`src/data/cards.js`)

- 450+ cartas divididas en 3 niveles: **Pre-Copa** (1), **Seducción** (2), **Xtasis** (3).
- Tipos: `truth` | `dare`.
- Los textos usan placeholders `{player1}`, `{player2}`, `{player3}` que se reemplazan en runtime con nombres reales.
- `getRandomCard(level, playedIds, players)` garantiza anti-repetición filtrando los ids ya jugados.

### Convenciones de UI

- **Glassmorphism** via utilidades CSS custom (`.glass-panel`, `.glass-card`) definidas en `globals.css`.
- Componente `GlassCard` (`src/components/UI/`) acepta props `tilt` y `glowColor` para efectos 3D/resplandor con Motion.
- `cn()` en `src/lib/utils.js` combina `clsx` + `tailwind-merge` — usar siempre para clases Tailwind condicionales.
- Tema oscuro forzado via `data-theme="dark"` (DaisyUI) en el root layout.

### Alias de importación

```js
import { cn } from '@/lib/utils'   // @ → src/
```
