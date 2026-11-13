import { LuSparkles, LuHeart, LuFlame, LuMoon, LuCrown, LuGem, LuZap, LuOrbit, LuFlower2, LuEye, LuInfinity, LuStar, LuShield, LuFeather, LuFingerprint, LuSmile, LuDiamond, LuFocus, LuSun, LuWaves } from 'react-icons/lu';
import { symbolId } from '@/data/symbols';

const ICONS = { spark: LuSparkles, heart: LuHeart, flame: LuFlame, moon: LuMoon, crown: LuCrown, gem: LuGem, bolt: LuZap, orbit: LuOrbit, flower: LuFlower2, eye: LuEye, infinity: LuInfinity, star: LuStar, shield: LuShield, feather: LuFeather, fingerprint: LuFingerprint, smile: LuSmile, diamond: LuDiamond, focus: LuFocus, sun: LuSun, waves: LuWaves };

export function PlayerSymbol({ symbol, size = '1em', ...props }) {
  const Icon = ICONS[symbolId(symbol)];
  return Icon ? <Icon size={size} strokeWidth={1.9} className="player-symbol" aria-hidden="true" focusable="false" {...props} /> : <span className="player-symbol-fallback" aria-hidden="true">{symbol || '✦'}</span>;
}
