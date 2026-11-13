'use client';
import { motion } from 'motion/react';

/* Ilustración vectorial: martini + copa de champán brindando, con burbujas y destellos. */
function Martini() {
  return (
    <svg viewBox="0 0 100 132" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="mt-liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b9a" />
          <stop offset="1" stopColor="#a30f45" />
        </linearGradient>
        <linearGradient id="gold-s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="130">
          <stop offset="0" stopColor="#ffe3e8" />
          <stop offset="0.5" stopColor="#e0143c" />
          <stop offset="1" stopColor="#7a0a1f" />
        </linearGradient>
        <clipPath id="mt-clip">
          <path d="M10 18 L90 18 L50 68 Z" />
        </clipPath>
      </defs>
      <path d="M10 18 L90 18 L50 68 Z" fill="rgba(255,227,232,0.07)" />
      <g clipPath="url(#mt-clip)">
        <rect x="0" y="36" width="100" height="40" fill="url(#mt-liq)" />
        <path d="M0 36 Q25 30 50 36 T100 36 V40 H0Z" fill="#ff9ab8" opacity="0.55">
          <animateTransform attributeName="transform" type="translate" values="-6 0; 6 0; -6 0" dur="3.6s" repeatCount="indefinite" />
        </path>
      </g>
      <path d="M10 18 L90 18 L50 68 Z" fill="none" stroke="url(#gold-s)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M17 22 L44 58" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 68 V112" stroke="url(#gold-s)" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 116 Q50 106 72 116" fill="none" stroke="url(#gold-s)" strokeWidth="3" strokeLinecap="round" />
      <line x1="26" y1="6" x2="64" y2="52" stroke="url(#gold-s)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="62" cy="49" r="5.4" fill="#ff2d6f" stroke="#7a0f2b" strokeWidth="1" />
      <circle cx="60.4" cy="47.4" r="1.4" fill="#fff" opacity="0.7" />
    </svg>
  );
}

function Coupe() {
  return (
    <svg viewBox="0 0 100 132" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cp-liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3e8" />
          <stop offset="1" stopColor="#e0143c" />
        </linearGradient>
        <linearGradient id="gold-c" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="130">
          <stop offset="0" stopColor="#ffe3e8" />
          <stop offset="0.5" stopColor="#e0143c" />
          <stop offset="1" stopColor="#7a0a1f" />
        </linearGradient>
        <clipPath id="cp-clip">
          <path d="M8 34 Q10 74 50 74 Q90 74 92 34 Z" />
        </clipPath>
      </defs>
      <path d="M8 34 Q10 74 50 74 Q90 74 92 34 Z" fill="rgba(255,227,232,0.07)" />
      <g clipPath="url(#cp-clip)">
        <rect x="0" y="46" width="100" height="40" fill="url(#cp-liq)" opacity="0.92" />
        {[[34, 62, 2], [50, 66, 2.6], [64, 60, 1.8], [44, 56, 1.5], [58, 70, 1.6]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity="0.8">
            <animate attributeName="cy" values={`${cy};${48}`} dur={`${2.4 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
            <animate attributeName="opacity" values="0.9;0" dur={`${2.4 + i * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
          </circle>
        ))}
      </g>
      <path d="M8 34 Q10 74 50 74 Q90 74 92 34 Z" fill="none" stroke="url(#gold-c)" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M8 34 H92" stroke="url(#gold-c)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M18 42 Q20 62 34 68" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 74 V112" stroke="url(#gold-c)" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 116 Q50 106 72 116" fill="none" stroke="url(#gold-c)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Star({ x, y, s = 1, delay = 0 }) {
  return (
    <svg viewBox="-10 -10 20 20" width={20 * s} height={20 * s} className="absolute pointer-events-none" style={{ left: x, top: y }} aria-hidden="true">
      <path className="sparkle" style={{ animationDelay: `${delay}s` }} d="M0 -9 C1 -3 3 -1 9 0 C3 1 1 3 0 9 C-1 3 -3 1 -9 0 C-3 -1 -1 -3 0 -9Z" fill="#ffe3e8" />
    </svg>
  );
}

export function Cheers({ size = 190 }) {
  return (
    <div className="relative mx-auto" style={{ width: size * 1.35, height: size }} aria-hidden="true">
      <motion.div
        className="absolute"
        style={{ width: size * 0.62, height: size * 0.82, left: '4%', bottom: 0, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 22px rgba(255,45,111,.35))' }}
        initial={{ rotate: -48, opacity: 0, y: 30 }}
        animate={{ rotate: -13, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 9, delay: 0.25 }}>
        <Martini />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ width: size * 0.62, height: size * 0.82, right: '4%', bottom: 0, transformOrigin: '50% 100%', filter: 'drop-shadow(0 10px 22px rgba(255,59,92,.35))' }}
        initial={{ rotate: 48, opacity: 0, y: 30 }}
        animate={{ rotate: 13, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 9, delay: 0.35 }}>
        <Coupe />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75, type: 'spring', stiffness: 300, damping: 12 }}>
        <Star x="46%" y="2%" s={1.7} />
        <Star x="34%" y="12%" s={0.9} delay={0.6} />
        <Star x="62%" y="9%" s={1.1} delay={1.1} />
      </motion.div>
    </div>
  );
}
