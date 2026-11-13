'use client';

import { useEffect, useState } from 'react';
import { LuExpand, LuMinimize, LuMonitor, LuMoveUpRight } from 'react-icons/lu';
import { toast } from 'sonner';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

export function TableIdentity() {
  return <div className="table-identity"><span>xtasis<span>.</span></span><small>THE PLAY ROOM <LuMoveUpRight /></small></div>;
}

export function DesktopTable({ player, round, room, players, onDraw, canDraw, truthLocked = false }) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const change = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);

  useEffect(() => {
    const handle = event => {
      if (!window.matchMedia('(min-width: 1024px)').matches || !canDraw || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      const type = { '1': 'truth', '2': 'dare', '3': 'random' }[event.key];
      if (!type || (type === 'truth' && truthLocked)) return;
      event.preventDefault(); onDraw(type);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [canDraw, onDraw, truthLocked]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast.error('Tu navegador no admite pantalla completa.');
    } catch { toast.error('El navegador no pudo cambiar a pantalla completa.'); }
  }
  return <div className="desktop-table-context"><div className="table-live"><span /> {room ? `SALA ${room}` : 'MESA COMPARTIDA'}</div><div className="table-round"><small>LA NOCHE VA EN</small><strong>Turno {round + 1}<span>↗</span></strong></div><div className="table-current"><span className="table-player-symbol" aria-hidden="true"><PlayerSymbol symbol={player?.avatar} /></span><div><small>PROTAGONISTA</small><strong>{player?.name || 'Por descubrir'}</strong></div></div><p>{players} cómplices en la mesa.<br />Cualquier pregunta se puede pasar.</p><div className="table-keyboard"><span>JUEGA CON TU TECLADO</span><div><kbd>1</kbd> Verdad</div><div><kbd>2</kbd> Reto</div><div><kbd>3</kbd> Sorpréndeme</div><small>{canDraw ? 'Tu turno: elige cómo sigue.' : 'Se activan cuando puedes sacar una carta.'}</small></div><button className="table-fullscreen" onClick={toggleFullscreen}>{fullscreen ? <LuMinimize /> : <LuExpand />}{fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}</button><span className="table-platform"><LuMonitor /> NIGHT MODE · DESKTOP</span></div>;
}

export function SetupIntro({ lobby = false }) {
  return <div className="setup-intro"><p className="eyebrow"><span className="status-dot" /> {lobby ? 'LA NOCHE ESTÁ POR EMPEZAR' : 'EN LA MISMA MESA. EN LA MISMA PANTALLA.'}</p><h1>{lobby ? <>El mejor plan<br />lo hacen <em>ustedes.</em></> : <>Buena compañía.<br /><em>Cero guiones.</em></>}</h1><p>{lobby ? 'Comparte el código o el QR. Cada invitado puede entrar desde su teléfono o computadora.' : 'Reúne a tus cómplices frente a la pantalla. Agrega sus nombres, elige la intensidad y deja que el juego haga lo suyo.'}</p><div className="setup-art" aria-hidden="true"><span>♡</span><i /><i /><b>LET’S PLAY.</b></div><span className="setup-footnote">PC, TABLET O TELÉFONO. LA NOCHE ES DE TODOS.</span></div>;
}
