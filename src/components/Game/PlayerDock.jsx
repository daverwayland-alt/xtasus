'use client';
import { motion } from 'motion/react';
import { Avatar, Pips } from '@/components/kit/Avatar';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';

/* Dock inferior: toda la mesa a la vista (vidas, turno activo, eliminados, carta dorada). */
export function PlayerDock({ players, lives, activeId, myId, golden = {}, drinks = {} }) {
  return (
    <div className="dock">
      <div className="desktop-roster-heading"><span>TUS CÓMPLICES</span><b>{players.length} en la mesa</b></div>
      <div className="dock-scroll no-scrollbar" role="list" aria-label="Jugadores">
        {players.map(p => {
          const l = lives[p.id] ?? 3;
          const dead = l <= 0;
          const active = p.id === activeId;
          return (
            <motion.div
              key={p.id}
              role="listitem"
              layout
              animate={{ y: active ? -5 : 0, scale: active ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              data-active={active}
              data-eliminated={dead}
              className="dock-item">
              <div className="relative">
                <Avatar player={p} size="md" active={active} dead={dead} />
                {golden[p.id]?.status === 'held' && (
                  <span className="absolute -top-1 -right-1 text-sm" title="Tiene carta dorada">🌟</span>
                )}
                {drinks[p.id] > 0 && (
                  <span
                    className="absolute -bottom-1 -right-1 rounded-full text-[0.55rem] font-black px-1.5 leading-[1.4]"
                    style={{ background: 'var(--orange)', color: '#1c0a00', border: '1.5px solid var(--ink)' }}>
                    <PlayerSymbol symbol="bolt" size={12} />{drinks[p.id]}
                  </span>
                )}
              </div>
              {dead ? <span className="text-[0.6rem]">👻</span> : <Pips lives={l} />}
              <span className="dock-name" style={{ color: p.id === myId ? 'var(--accent)' : undefined }}>
                {p.id === myId ? <><span className="desktop-player-name">{p.name} · </span>Tú</> : p.name}
              </span>
              <span className="desktop-player-state">{dead ? 'Mirando la partida' : active ? 'Es su turno' : `${l} ${l === 1 ? 'vida' : 'vidas'}`}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="desktop-roster-note">Un buen reto empieza con todos a gusto.</p>
    </div>
  );
}
