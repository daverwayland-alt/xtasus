'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { LuArrowLeft, LuArrowUpRight, LuSearch, LuMoon, LuSparkles, LuHeart, LuSplit, LuDices, LuEye, LuTimer, LuMessageCircle, LuMartini, LuAudioLines, LuTicket, LuLayers, LuBookmark, LuListChecks, LuWallet } from 'react-icons/lu';
import { Sheet } from '@/components/kit/Drawer';
import { LOUNGE_TOOLS } from '@/data/lounge';
import { Oracle, Chemistry, Dilemma, Roulette, Spy, FiveSeconds, Taboo } from './LoungeGames';
import { Mixology, Soundscape, Invitation, DeckStudio, Favorites, Planner, BillSplit } from './LoungeTools';

const ICONS = { moon: LuMoon, spark: LuSparkles, heart: LuHeart, split: LuSplit, dice: LuDices, eye: LuEye, timer: LuTimer, message: LuMessageCircle, glass: LuMartini, sound: LuAudioLines, ticket: LuTicket, cards: LuLayers, bookmark: LuBookmark, list: LuListChecks, wallet: LuWallet };
const DEFAULT = JSON.stringify({ favorites: [], deck: [], plan: [{ id: 'arrival', name: 'La primera copa', minutes: 15, done: false }, { id: 'connection', name: 'Romper el hielo', minutes: 20, done: false }, { id: 'after', name: 'Entre miradas', minutes: 25, done: false }] });
const KEY = 'xtasis_lounge_v1';
const listeners = new Set();
let fallback = DEFAULT;
const emit = () => listeners.forEach(fn => fn());
const subscribe = cb => { listeners.add(cb); window.addEventListener('storage', cb); return () => { listeners.delete(cb); window.removeEventListener('storage', cb); }; };
const snapshot = () => { try { return localStorage.getItem(KEY) || fallback; } catch { return fallback; } };
function useCollection() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => DEFAULT);
  const value = useMemo(() => {
    try {
      const parsed = JSON.parse(raw); const defaults = JSON.parse(DEFAULT);
      return {
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter(x => typeof x === 'string').slice(0, 200) : [],
        deck: Array.isArray(parsed.deck) ? parsed.deck.filter(x => typeof x?.id === 'string' && typeof x?.text === 'string').slice(0, 200) : [],
        plan: Array.isArray(parsed.plan) ? parsed.plan.filter(x => typeof x?.id === 'string' && typeof x?.name === 'string' && Number.isFinite(x.minutes)).slice(0, 20) : defaults.plan,
      };
    } catch { return JSON.parse(DEFAULT); }
  }, [raw]);
  const update = (field, items) => {
    const next = JSON.stringify({ ...value, [field]: items }); fallback = next;
    try { localStorage.setItem(KEY, next); } catch { toast.error('El navegador no permite guardar. Exporta tus cartas antes de salir.'); }
    emit();
  };
  return [value, update];
}

export default function Lounge() {
  const [group, setGroup] = useState('Todo');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const [collection, update] = useCollection();
  const selected = LOUNGE_TOOLS.find(t => t.id === active);
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const visible = LOUNGE_TOOLS.filter(tool => (group === 'Todo' || tool.group === group) && normalize(`${tool.title} ${tool.description}`).includes(normalize(query)));
  const saveFavorite = text => update('favorites', collection.favorites.includes(text) ? collection.favorites.filter(t => t !== text) : [...collection.favorites, text].slice(-200));
  function panel() {
    switch (active) {
      case 'journey': return <Oracle journey favorites={collection.favorites} saveFavorite={saveFavorite} />;
      case 'oracle': return <Oracle favorites={collection.favorites} saveFavorite={saveFavorite} />;
      case 'chemistry': return <Chemistry />;
      case 'dilemma': return <Dilemma />;
      case 'roulette': return <Roulette />;
      case 'spy': return <Spy />;
      case 'seconds': return <FiveSeconds />;
      case 'taboo': return <Taboo />;
      case 'mixology': return <Mixology />;
      case 'sound': return <Soundscape />;
      case 'invitation': return <Invitation />;
      case 'studio': return <DeckStudio deck={collection.deck} setDeck={items => update('deck', items)} />;
      case 'favorites': return <Favorites favorites={collection.favorites} saveFavorite={saveFavorite} />;
      case 'planner': return <Planner plan={collection.plan} setPlan={items => update('plan', items)} />;
      case 'split': return <BillSplit />;
      default: return null;
    }
  }
  return <main className="lounge-page"><header className="night-nav"><Link href="/" className="night-wordmark">xtasis<span>.</span></Link><Link className="understated-link" href="/"><LuArrowLeft /> Volver a la noche</Link></header><section className="lounge-intro"><p className="eyebrow"><span className="status-dot" /> TU CLUB. TUS REGLAS.</p><h1>Haz que<br /><em>pase algo.</em></h1><p>La noche no necesita un plan perfecto.<br />Solo una buena excusa para empezar.</p><span className="lounge-counter">15 experiencias · Un solo dispositivo · Sin registro</span></section><div className="lounge-toolbar"><div className="lounge-filters" role="group" aria-label="Categorías">{['Todo', 'Juegos', 'Conexión', 'La barra', 'Ambiente', 'La noche'].map(item => <button aria-pressed={group === item} onClick={() => setGroup(item)} key={item}>{item}</button>)}</div><label className="lounge-search"><LuSearch /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Encuentra tu próximo plan" aria-label="Buscar experiencias" /></label></div><div className="lounge-tools-grid">{visible.map(tool => { const Icon = ICONS[tool.icon]; return <motion.button initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .25 }} key={tool.id} className={`lounge-tool tool-${tool.id}`} onClick={() => setActive(tool.id)}><div className="tool-top"><Icon strokeWidth={1.25} /><span>{tool.group}</span><LuArrowUpRight /></div><h2>{tool.title}</h2><p>{tool.description}</p><span className="tool-index">{String(LOUNGE_TOOLS.indexOf(tool) + 1).padStart(2, '0')} / THE PRIVATE COLLECTION</span></motion.button>; })}</div>{!visible.length && <div className="empty-state"><h2>No encontramos ese plan.</h2><button className="night-button secondary" onClick={() => { setGroup('Todo'); setQuery(''); }}>Ver todas las experiencias</button></div>}<footer className="night-footer"><Link href="/" className="night-wordmark">xtasis<span>.</span></Link><p>Menos scroll. Más conexión.</p><span>+18 · A TU RITMO</span></footer><Sheet open={!!active} onOpenChange={open => !open && setActive(null)} title={selected?.title || 'El lounge'} subtitle={selected?.description}>{active && <div key={active} className="lounge-panel">{panel()}</div>}</Sheet></main>;
}
