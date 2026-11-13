'use client';
import { getSettings } from './settings';

/* Sonido sintetizado con WebAudio (sin archivos) + vibración háptica. */
let ctx = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone({ f = 440, to, dur = 0.12, type = 'sine', vol = 0.08, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  click: () => tone({ f: 520, to: 380, dur: 0.07, type: 'triangle', vol: 0.06 }),
  tick: () => tone({ f: 900, dur: 0.04, type: 'square', vol: 0.03 }),
  pop: () => tone({ f: 300, to: 760, dur: 0.1, type: 'sine', vol: 0.08 }),
  reveal: () => {
    tone({ f: 330, to: 660, dur: 0.18, type: 'sawtooth', vol: 0.05 });
    tone({ f: 660, to: 990, dur: 0.22, type: 'triangle', vol: 0.05, delay: 0.1 });
  },
  success: () => [523, 659, 784].forEach((f, i) => tone({ f, dur: 0.16, type: 'triangle', vol: 0.07, delay: i * 0.08 })),
  fail: () => {
    tone({ f: 220, to: 90, dur: 0.35, type: 'sawtooth', vol: 0.07 });
    tone({ f: 165, to: 70, dur: 0.4, type: 'square', vol: 0.04, delay: 0.05 });
  },
  levelup: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone({ f, dur: 0.2, type: 'sawtooth', vol: 0.05, delay: i * 0.09 })),
  bomb: () => tone({ f: 1200, dur: 0.05, type: 'square', vol: 0.05 }),
  boom: () => {
    tone({ f: 140, to: 30, dur: 0.7, type: 'sawtooth', vol: 0.18 });
    tone({ f: 80, to: 20, dur: 0.8, type: 'square', vol: 0.12 });
  },
  chaos: () => {
    [200, 300, 200, 400].forEach((f, i) => tone({ f, to: f * 1.6, dur: 0.12, type: 'square', vol: 0.05, delay: i * 0.07 }));
  },
  water: () => {
    tone({ f: 700, to: 1100, dur: 0.12, type: 'sine', vol: 0.06 });
    tone({ f: 900, to: 1400, dur: 0.14, type: 'sine', vol: 0.05, delay: 0.1 });
  },
};

export function sfx(name) {
  if (!getSettings().sound) return;
  try {
    SOUNDS[name]?.();
  } catch {}
}

const PATTERNS = {
  light: 10,
  medium: 22,
  heavy: [40, 30, 60],
  success: [15, 40, 15],
  fail: [70, 40, 70, 40, 120],
  boom: [160, 60, 220],
  tick: 6,
};

export function haptic(kind = 'light') {
  if (!getSettings().haptics) return;
  try {
    navigator.vibrate?.(PATTERNS[kind] ?? 10);
  } catch {}
}

/* Combo útil: sonido + vibración */
export function feel(sound, vibe = 'light') {
  sfx(sound);
  haptic(vibe);
}

/* Narrador (speechSynthesis) */
export function speak(text) {
  if (typeof window === 'undefined' || !getSettings().narrator || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-MX';
    u.rate = 1.02;
    u.pitch = 0.9;
    window.speechSynthesis.speak(u);
  } catch {}
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {}
}
