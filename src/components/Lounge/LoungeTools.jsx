'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { LuArrowRight, LuBookmark, LuDownload, LuPlus, LuTrash2 } from 'react-icons/lu';
import { COCKTAILS } from '@/data/lounge';
import { downloadFile, shuffle, splitBill, validateDeck } from '@/lib/lounge';
import { Action, Choices, Prompt } from './LoungeGames';

export function Mixology() {
  const [filter, setFilter] = useState('Todos');
  const [family, setFamily] = useState('Todos los perfiles');
  const [servings, setServings] = useState(2);
  const [active, setActive] = useState(null);
  const list = COCKTAILS.filter(c => (filter === 'Todos' || (filter === 'Sin alcohol' ? !c.alcohol : c.alcohol)) && (family === 'Todos los perfiles' || c.family === family));
  const recipe = COCKTAILS.find(c => c.id === active);
  return <div className="panel-stack"><Choices label="Tipo de cóctel" values={['Todos', 'Sin alcohol', 'Con alcohol']} value={filter} onChange={setFilter} /><label className="field-label">Tu perfil de sabor<select className="input" value={family} onChange={e => setFamily(e.target.value)}>{['Todos los perfiles', 'Amargo', 'Cítrico', 'Frutal', 'Herbal'].map(f => <option key={f}>{f}</option>)}</select></label><div className="recipe-grid">{list.map(c => <button className="recipe-option" key={c.id} aria-pressed={active === c.id} onClick={() => setActive(c.id)}><span>♧</span><strong>{c.name}</strong><small>{c.note}</small><LuArrowRight /></button>)}</div>{!list.length && <p>No hay una mezcla con ambos filtros. Prueba otro perfil.</p>}{recipe && <div className="recipe-detail"><p className="eyebrow">LA RECETA</p><h3>{recipe.name}</h3><label className="field-label">Copas: {servings}<input type="range" min="1" max="8" value={servings} onChange={e => setServings(+e.target.value)} /></label>{recipe.ingredients.map(([ingredient, amount, unit]) => <div className="result-row" key={ingredient}><span>{ingredient}</span><strong>{amount * servings} {unit}</strong></div>)}<p>{recipe.method}</p><small>El detalle final: {recipe.garnish}. Cantidades totales para {servings} {servings === 1 ? 'copa' : 'copas'}.</small></div>}</div>;
}

export function Soundscape() {
  const [preset, setPreset] = useState('Velvet');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(15);
  const audio = useRef(null);
  useEffect(() => () => { audio.current?.context.close().catch(() => {}); }, []);
  useEffect(() => {
    if (audio.current) audio.current.gain.gain.setTargetAtTime(volume / 100 * .12, audio.current.context.currentTime, .2);
  }, [volume]);
  const stop = () => { audio.current?.context.close().catch(() => {}); audio.current = null; setPlaying(false); };
  async function start() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { toast.error('Este navegador no permite audio sintetizado.'); return; }
      const context = new AC();
      audio.current = { context, gain: context.createGain() };
      await context.resume();
      const gain = audio.current.gain;
      gain.gain.value = volume / 100 * .12; gain.connect(context.destination);
      const frequencies = { Velvet: [130.81, 196, 261.63, 329.63], 'Luz de luna': [146.83, 220, 293.66, 369.99], 'Última copa': [110, 164.81, 220, 277.18] }[preset];
      frequencies.forEach((frequency, i) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.detune.value = i * 2;
        const voice = context.createGain(); voice.gain.value = 1 / frequencies.length;
        oscillator.connect(voice).connect(gain); oscillator.start();
        const lfo = context.createOscillator(); const depth = context.createGain();
        lfo.frequency.value = .08 + i * .03; depth.gain.value = .08;
        lfo.connect(depth).connect(voice.gain); lfo.start();
      });
      setPlaying(true);
    } catch { audio.current?.context.close().catch(() => {}); audio.current = null; toast.error('No se pudo iniciar el audio. Inténtalo de nuevo.'); }
  }
  return <div className="panel-stack"><Choices label="Ambiente sonoro" values={['Velvet', 'Luz de luna', 'Última copa']} value={preset} onChange={v => { stop(); setPreset(v); }} /><div className={`sound-visualizer ${playing ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 19 }, (_, i) => <i key={i} style={{ '--bar': `${18 + ((i * 17) % 59)}px`, '--delay': `${i * -.13}s` }} />)}</div><Prompt label="AMBIENT SINTETIZADO EN TU DISPOSITIVO">{preset}</Prompt><label className="field-label">Volumen · {volume}%<input type="range" min="0" max="100" value={volume} onChange={e => setVolume(+e.target.value)} /></label><Action onClick={playing ? stop : start}>{playing ? 'Pausar ambiente' : 'Encender la atmósfera'}</Action><p className="helper-copy">Una textura de acordes suaves, sin canciones ni conexión a servicios musicales. Se detiene al cerrar este panel.</p></div>;
}

export function Invitation() {
  const [title, setTitle] = useState('Una noche diferente');
  const [host, setHost] = useState('Tu anfitrión');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('Un lugar por descubrir');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const qr = useRef(null);
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const url = origin + (code.length === 4 ? `/lobby/${code}` : '');
  const dateLabel = date ? new Date(date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'La noche nos espera';
  async function download() {
    try {
      if (code && code.length !== 4) { setError('El código de sala debe tener cuatro caracteres.'); return; }
      if (code) {
        const res = await fetch(`/api/game/${code}`, { cache: 'no-store' });
        if (!res.ok) { setError('Esa sala no está disponible. Revisa el código o déjalo vacío para una invitación sin sala.'); return; }
      }
      const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1440;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#111015'; ctx.fillRect(0, 0, 1080, 1440);
      ctx.strokeStyle = '#f36393'; ctx.lineWidth = 2; ctx.strokeRect(55, 55, 970, 1330);
      ctx.textAlign = 'center'; ctx.fillStyle = '#ff89b0';
      ctx.font = '800 100px sans-serif'; ctx.fillText('xtasis.', 540, 230);
      ctx.font = '22px sans-serif'; ctx.fillText('T H E   A F T E R   D A R K   C O L L E C T I O N', 540, 310);
      ctx.font = '600 60px sans-serif';
      const words = title.split(' '); let line = ''; let y = 485;
      words.forEach(word => { const next = `${line}${word} `; if (ctx.measureText(next).width > 850 && line) { ctx.fillText(line.trim(), 540, y); y += 76; line = `${word} `; } else line = next; });
      ctx.fillText(line.trim(), 540, y);
      ctx.font = '29px sans-serif'; ctx.fillText(`Te invita: ${host}`, 540, 780); ctx.fillText(dateLabel, 540, 850); ctx.fillText(place, 540, 915);
      const svg = qr.current?.querySelector('svg');
      if (svg) {
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
        const qrUrl = URL.createObjectURL(blob);
        try { const img = new window.Image(); img.src = qrUrl; await img.decode(); ctx.drawImage(img, 440, 990, 200, 200); } finally { URL.revokeObjectURL(qrUrl); }
      }
      ctx.font = '22px sans-serif'; ctx.fillText(code ? `TU CÓDIGO: ${code}` : 'MENOS SCROLL. MÁS CONEXIÓN.', 540, 1260);
      canvas.toBlob(blob => { if (blob) downloadFile('xtasis-invitacion.png', blob, 'image/png'); else toast.error('No se pudo generar la imagen.'); }, 'image/png');
    } catch { toast.error('No se pudo descargar la invitación.'); }
  }
  return <div className="panel-stack"><div className="invitation-preview"><span className="eyebrow">ESTÁS INVITADO A</span><h3>{title}</h3><span>por {host}</span><p>{dateLabel}<br />{place}</p><div ref={qr}>{origin && <QRCodeSVG value={url} size={96} bgColor="#111015" fgColor="#ff89b0" />}</div><small>{code || 'AFTER DARK · XTASIS'}</small></div><div className="lounge-form"><label>Título<input className="input" value={title} maxLength={48} onChange={e => setTitle(e.target.value)} /></label><label>Quién invita<input className="input" value={host} maxLength={32} onChange={e => setHost(e.target.value)} /></label><label>Cuándo<input className="input" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></label><label>Dónde<input className="input" value={place} maxLength={48} onChange={e => setPlace(e.target.value)} /></label><label>Código de sala · opcional<input className="input" value={code} maxLength={4} placeholder="ABCD" onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }} /></label>{error && <p className="night-error" role="alert">{error}</p>}<Action disabled={!title.trim() || !host.trim() || !place.trim()} onClick={download}><LuDownload /> Descargar pase en PNG</Action></div></div>;
}

export function DeckStudio({ deck, setDeck }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(null);
  const [queue, setQueue] = useState([]);
  const file = useRef(null);
  function add(e) { e.preventDefault(); if (!text.trim() || deck.length >= 200) return; setDeck([...deck, { id: crypto.randomUUID(), text: text.trim() }]); setText(''); setQueue([]); setPlaying(null); }
  async function load(e) {
    try {
      const selected = e.target.files[0]; if (!selected) return;
      if (selected.size > 200000) throw new Error('El archivo supera los 200 KB.');
      const imported = validateDeck(JSON.parse(await selected.text()));
      if (deck.length + imported.length > 200) throw new Error('La colección completa no puede superar 200 cartas.');
      setDeck([...deck, ...imported.map(c => ({ ...c, id: crypto.randomUUID() }))]); setQueue([]); setPlaying(null); setError(''); toast.success('Cartas añadidas a tu mazo.');
    } catch (err) { setError(err instanceof SyntaxError ? 'El archivo no es JSON válido.' : err.message); }
    e.target.value = '';
  }
  function draw() { const next = queue.length ? queue : shuffle(deck); setPlaying(next[0]); setQueue(next.slice(1)); }
  return <div className="panel-stack"><p className="helper-copy">Tu colección se guarda en este navegador. Exporta un respaldo para llevarla a otro dispositivo.</p><form className="lounge-form" onSubmit={add}><label htmlFor="new-card">Una pregunta, un reto, una idea<textarea id="new-card" className="input lounge-textarea" value={text} maxLength={400} onChange={e => setText(e.target.value)} placeholder="Si esta noche fuera una película…" /></label><Action type="submit" disabled={!text.trim() || deck.length >= 200}><LuPlus /> Añadir carta · {deck.length}/200</Action></form><div className="panel-actions"><Action secondary onClick={() => file.current.click()}>Importar JSON</Action><Action secondary disabled={!deck.length} onClick={() => downloadFile('xtasis-mi-mazo.json', JSON.stringify({ version: 1, cards: deck }, null, 2))}><LuDownload /> Exportar</Action><input ref={file} type="file" accept=".json,application/json" hidden onChange={load} aria-label="Importar cartas" /></div><small className="helper-copy">Formato: una lista de textos o un objeto con una lista «cards» de objetos con «text». La importación añade cartas a las existentes.</small>{error && <p role="alert" className="night-error">{error}</p>}{deck.length > 0 && <><Prompt label="TU MAZO PRIVADO">{playing?.text || 'Las reglas, esta vez, las escribes tú.'}</Prompt><Action onClick={draw}>Sacar una carta <LuArrowRight /></Action><div className="saved-list">{deck.map(c => <div className="result-row" key={c.id}><span>{c.text}</span><button className="round-button" aria-label={`Eliminar carta: ${c.text}`} onClick={() => { setDeck(deck.filter(item => item.id !== c.id)); setPlaying(null); setQueue([]); }}><LuTrash2 /></button></div>)}</div></>}</div>;
}

export function Favorites({ favorites, saveFavorite }) {
  const [selected, setSelected] = useState(null);
  if (!favorites.length) return <div className="panel-stack"><Prompt label="LAS BUENAS PREGUNTAS MERECEN QUEDARSE">Tu colección está por empezar.</Prompt><p>Abre El oráculo o Ritual de la noche y toca «Guardar pregunta». Las encontrarás aquí, en este navegador.</p></div>;
  return <div className="panel-stack">{selected && <Prompt label="DE TU COLECCIÓN">{selected}</Prompt>}<Action onClick={() => setSelected(shuffle(favorites)[0])}>Una pregunta al azar</Action>{favorites.map(text => <div className="result-row" key={text}><span>{text}</span><button className="round-button" aria-label={`Quitar de la colección: ${text}`} onClick={() => { saveFavorite(text); if (selected === text) setSelected(null); }}><LuBookmark /></button></div>)}<Action secondary onClick={() => downloadFile('xtasis-coleccion.txt', favorites.join('\n\n'), 'text/plain')}><LuDownload /> Llevar mi colección</Action></div>;
}

export function Planner({ plan, setPlan }) {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [timer, setTimer] = useState(null);
  const [now, setNow] = useState(0);
  useEffect(() => { if (!timer) return; const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, [timer]);
  const remaining = timer ? Math.max(0, Math.ceil((timer.end - now) / 1000)) : 0;
  return <div className="panel-stack"><p className="helper-copy">Tu itinerario queda guardado en este navegador. El reloj está activo mientras este panel esté abierto.</p>{timer && <div className="planner-timer" role="timer"><span>{timer.name}</span><strong>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</strong><small>{remaining === 0 ? 'Este acto ha terminado. Tú decides cuándo seguir.' : 'Disfruta el momento.'}</small><Action secondary onClick={() => setTimer(null)}>Detener reloj</Action></div>}<div className="agenda-list">{plan.map((act, i) => <div className={`agenda-item ${act.done ? 'done' : ''}`} key={act.id}><input type="checkbox" checked={act.done} aria-label={`Completar ${act.name}`} onChange={() => setPlan(plan.map(a => a.id === act.id ? { ...a, done: !a.done } : a))} /><span><small>ACTO {String(i + 1).padStart(2, '0')} · {act.minutes} MIN</small><strong>{act.name}</strong></span><button className="text-button" onClick={() => { const time = Date.now(); setNow(time); setTimer({ name: act.name, end: time + act.minutes * 60000 }); }}>Iniciar</button><button className="round-button" aria-label={`Eliminar ${act.name}`} onClick={() => setPlan(plan.filter(a => a.id !== act.id))}><LuTrash2 /></button></div>)}</div><form className="lounge-form" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; setPlan([...plan, { id: crypto.randomUUID(), name: name.trim(), minutes, done: false }]); setName(''); }}><label>Próximo acto<input className="input" value={name} maxLength={60} onChange={e => setName(e.target.value)} placeholder="La última copa" /></label><label>Duración · {minutes} minutos<input type="range" min="1" max="90" value={minutes} onChange={e => setMinutes(+e.target.value)} /></label><Action type="submit" disabled={!name.trim() || plan.length >= 20}><LuPlus /> Añadir al itinerario</Action></form></div>;
}

export function BillSplit() {
  const [amount, setAmount] = useState('');
  const [tip, setTip] = useState(10);
  const [count, setCount] = useState(4);
  const result = amount.trim() ? splitBill(Number(amount), tip, count) : null;
  const money = n => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  async function copy() { try { await navigator.clipboard.writeText(`Xtasis · La cuenta\nTotal: ${money(result.total)}\nPropina: ${money(result.tip)}\n${result.shares.map((n, i) => `Persona ${i + 1}: ${money(n)}`).join('\n')}`); toast.success('Cuenta copiada.'); } catch { toast.error('No fue posible copiar. Puedes seleccionar los importes.'); } }
  return <div className="panel-stack"><div className="lounge-form"><label>Cuenta antes de propina · MXN<input className="input" type="number" min="0" max="1000000" step="0.01" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" /></label><label>Propina · {tip}%<input type="range" min="0" max="30" value={tip} onChange={e => setTip(+e.target.value)} /></label><label>Personas<select className="input" value={count} onChange={e => setCount(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label></div>{result ? <><div className="bill-total"><span>TOTAL CON PROPINA</span><strong>{money(result.total)}</strong><small>Propina: {money(result.tip)}</small></div>{result.shares.map((n, i) => <div key={i} className="result-row"><span>Persona {i + 1}</span><strong>{money(n)}</strong></div>)}<small className="helper-copy">El redondeo se reparte por centavos. La suma coincide exactamente con el total.</small><Action onClick={copy}>Copiar desglose</Action></> : <p className="helper-copy">Introduce un importe válido para ver el reparto.</p>}</div>;
}
