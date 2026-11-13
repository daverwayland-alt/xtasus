'use client';
import { useSyncExternalStore } from 'react';

const KEY = 'xtasis_settings';
const DEFAULTS = { sound: true, haptics: true, narrator: false, water: true };

let cache = null;
const listeners = new Set();

function read() {
  if (cache) return cache;
  try {
    cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

export function getSettings() {
  return typeof window === 'undefined' ? DEFAULTS : read();
}

export function setSetting(key, value) {
  cache = { ...read(), [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach(l => l());
}

const subscribe = cb => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULTS);
}
