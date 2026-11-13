import { cn } from '@/lib/utils';
import { PlayerSymbol } from './PlayerSymbol';

export function Avatar({ player, size = 'md', active, dead, className, style }) {
  return (
    <span
      className={cn('avatar', `avatar-${size}`, active && 'avatar-active', dead && 'avatar-dead', className)}
      style={style}
      aria-label={player?.name}>
      <PlayerSymbol symbol={player?.avatar} />
    </span>
  );
}

export function Pips({ lives = 0, max = 3 }) {
  return (
    <span className="pips" aria-label={`${lives} de ${max} vidas`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={cn('pip', i >= lives && 'pip-off')} />
      ))}
    </span>
  );
}
