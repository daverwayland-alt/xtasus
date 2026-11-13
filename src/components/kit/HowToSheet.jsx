'use client';
import { Sheet } from './Drawer';
import { LEVEL_THEME } from '@/data/party';
import { PlayerSymbol } from './PlayerSymbol';

const MODES = [
  { e: '🎯', t: 'Quién es más probable', d: 'Todos votan a alguien. El más señalado bebe.' },
  { e: '🙋', t: 'Yo nunca', d: 'Quien sí lo hizo, bebe. Se revelan todos al mismo tiempo.' },
  { e: '💣', t: 'Papa caliente', d: 'Pasa la bomba antes de que explote. Quien la tenga pierde una vida.' },
  { e: '📜', t: 'Leyes', d: 'Cualquiera dicta una regla vigente para toda la mesa.' },
  { e: '🌪️', t: 'Caos', d: 'Cada ciertos turnos cae un evento sorpresa para todos.' },
  { e: '🕵️', t: 'Misión secreta', d: 'Cada quien tiene una misión. Cúmplela sin que te descubran.' },
];

export function HowToSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Cómo se juega" subtitle="Dos minutos y listo">
      <ol className="flex flex-col gap-3 text-sm leading-relaxed" style={{ color: 'var(--paper)' }}>
        <li>
          <b className="font-display text-xs uppercase" style={{ color: 'var(--accent)' }}>1 · Todos entran</b>
          <br />
          Uno crea la sala y comparte el código o el QR. De 2 a 8 jugadores, cada uno desde su celular.
        </li>
        <li>
          <b className="font-display text-xs uppercase" style={{ color: 'var(--accent)' }}>2 · Tu turno</b>
          <br />
          Elige verdad, reto o aleatorio. Cúmplelo y el grupo vota. Si te rindes, pierdes una vida ❤️.
        </li>
        <li>
          <b className="font-display text-xs uppercase" style={{ color: 'var(--accent)' }}>3 · Sobrevive</b>
          <br />
          Tienes 3 vidas. Úsalas con cabeza: los cócteles de tu barra te dan poderes, y el último en pie gana.
        </li>
      </ol>

      <p className="eyebrow mt-5 mb-2">Niveles</p>
      <div className="flex flex-col gap-2">
        {Object.entries(LEVEL_THEME).map(([n, t]) => (
          <div key={n} className="panel-2 flex items-center gap-3" style={{ padding: '0.6rem 0.8rem', borderColor: t.color }}>
            <span className="text-xl"><PlayerSymbol symbol={t.emoji} /></span>
            <div>
              <p className="font-display text-xs font-extrabold uppercase" style={{ color: t.color }}>
                {n} · {t.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {t.tag}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="eyebrow mt-5 mb-2">Modos sorpresa</p>
      <div className="grid grid-cols-2 gap-2">
        {MODES.map(m => (
          <div key={m.t} className="panel-2" style={{ padding: '0.7rem' }}>
            <span className="text-xl">{m.e}</span>
            <p className="font-display text-[0.68rem] font-extrabold uppercase mt-1">{m.t}</p>
            <p className="text-[0.7rem] mt-0.5" style={{ color: 'var(--muted)' }}>
              {m.d}
            </p>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
