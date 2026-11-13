'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LuArrowUpRight, LuArrowRight, LuSettings2, LuUsers, LuCheck, LuMoveDown, LuSparkles } from 'react-icons/lu';
import { Sheet } from '@/components/kit/Drawer';
import { SettingsSheet } from '@/components/kit/SettingsSheet';
import { HowToSheet } from '@/components/kit/HowToSheet';
import { Spinner } from '@/components/kit/Btn';
import { loadSession, clearSession } from '@/lib/session';
import { EXPERIENCES } from '@/data/lounge';

const enter = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: .7 } };

export default function Home() {
  const router = useRouter();
  const [sheet, setSheet] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resume, setResume] = useState(null);
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    const controller = new AbortController();
    fetch(`/api/game/${saved.gameId}`, { cache: 'no-store', signal: controller.signal })
      .then(r => r.ok ? r.json() : null).then(game => {
        if (game?.players?.some(p => p.id === saved.playerId)) setResume({ ...saved, status: game.status });
        else clearSession();
      }).catch(() => {});
    return () => controller.abort();
  }, []);
  async function createRoom() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!response.ok) throw new Error();
      const game = await response.json();
      router.push(`/lobby/${game.id}?host=true`);
    } catch { setError('La sala no pudo abrirse. Inténtalo de nuevo.'); setBusy(false); }
  }
  async function joinRoom(event) {
    event.preventDefault();
    if (code.length !== 4) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/game/${code}`, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      router.push(`/lobby/${code}`);
    } catch { setError('No encontramos esa sala. Revisa tu código.'); setBusy(false); }
  }
  return (
    <main className="night-home">
      <a className="skip-link" href="#main-content">Ir al contenido</a>
      <header className="night-nav">
        <Link href="/" className="night-wordmark" aria-label="Xtasis, inicio">xtasis<span>.</span></Link>
        <nav aria-label="Navegación principal"><a href="#experiencias">Las experiencias</a><Link href="/lounge">El lounge <span className="nav-new">NUEVO</span></Link><button onClick={() => setSheet('how')}>El ritual</button></nav>
        <div className="nav-actions"><button className="round-button" aria-label="Ajustes" onClick={() => setSheet('settings')}><LuSettings2 /></button><button className="nav-invite" onClick={() => { setError(''); setSheet('join'); }}>Tengo invitación <LuArrowUpRight /></button></div>
      </header>
      <section className="night-hero" id="main-content">
        <motion.div className="hero-editorial" {...enter}>
          <p className="eyebrow"><span className="status-dot" /> CONEXIONES REALES. NOCHES IMPREDECIBLES.</p>
          <h1>Tu noche.<br />Tus reglas.<br /><span className="hero-last">Cero filtros.</span></h1>
          <p className="hero-description">El plan es no saber qué sigue.<br />Verdades, retos y esa química que<br className="desktop-break" /> no cabe en un chat.</p>
          <div className="hero-actions"><button className="night-button primary" onClick={createRoom} disabled={busy}>{busy ? <Spinner /> : <>Que empiece la noche <span><LuArrowUpRight /></span></>}</button><Link className="understated-link" href="/offline">Compartir pantalla y jugar <LuArrowRight /></Link></div>
          {error && sheet !== 'join' && <p className="night-error" role="alert">{error}</p>}
          {resume && <Link className="resume-link" href={`/${resume.status === 'playing' ? 'game' : 'lobby'}/${resume.gameId}`}>Tu mesa sigue aquí · Volver a {resume.gameId} <LuArrowRight /></Link>}
          <div className="hero-proof"><div className="guest-tokens" aria-hidden="true"><span>A</span><span>M</span><span>V</span><span>+</span></div><p><strong>De 2 a 8 cómplices.</strong><br />Sin descargas. Con mucha química.</p></div>
        </motion.div>
        <motion.div className="hero-scene" {...enter} transition={{ duration: .9, delay: .15 }}>
          <div className="hero-photo"><Image src="/images/night-flash.webp" alt="Bola disco cromada y cócteles cereza bajo luces rosas y carmesí" fill priority sizes="(max-width: 767px) 100vw, 50vw" className="editorial-image" /><div className="scene-shade" /><span className="scene-edition"><span className="status-dot" /> NIGHT MODE: ON</span><span className="scene-side">GOOD COMPANY. UNEXPECTED NIGHTS.</span><div className="scene-bottom"><span>El resto que espere.</span><span>+18 / SIN PRISA</span></div></div>
          <div className="preview-card"><span className="preview-eyebrow"><span>♡</span> VERDAD O RETO <span>02</span></span><p>¿Quién de aquí<br />te pone un poco<br /><em>en modo nervios?</em></p><span className="preview-bottom">TU TURNO. SIN FILTRO. <LuArrowUpRight /></span></div>
          <div className="scene-seal" aria-hidden="true"><span>NO SCRIPT</span><b>↗</b><span>JUST PLAY</span></div>
        </motion.div>
      </section>
      <div className="night-manifesto"><span>BUENA COMPAÑÍA</span><i>✦</i><span>CERO GUIONES</span><i>✦</i><span>QUÍMICA REAL</span><i>✦</i><span>TUS PROPIAS REGLAS</span><i>✦</i><a href="#experiencias" aria-label="Descubrir las experiencias"><LuMoveDown /></a></div>
      <section className="experiences-section" id="experiencias">
        <div className="section-heading"><div><p className="eyebrow">ELIGE TU MOOD</p><h2>¿Qué se juega <em>hoy?</em></h2></div><p>Empieza suave. O no.<br />La intensidad la ponen ustedes.</p></div>
        <div className="experience-grid">{EXPERIENCES.map((experience, index) => <Link href={`/offline?level=${experience.level}`} key={experience.id} className={`experience-tile ${experience.color}`}><span className="experience-number">0{index + 1} <LuArrowUpRight /></span><div className="experience-art" aria-hidden="true"><span>{experience.suit}</span><i /><i /></div><div className="experience-copy"><p className="eyebrow">{experience.tag}</p><h3>{experience.name}</h3><p>{experience.description}</p><span className="experience-meta"><LuUsers /> 2–8 <span /> {experience.duration}<b>{experience.mood}</b></span></div></Link>)}</div>
      </section>
      <section className="lounge-teaser"><div><p className="eyebrow"><LuSparkles /> LA NOCHE TIENE MÁS PLANES</p><h2>Bienvenido<br />a <em>tu lounge.</em></h2><p>Quince maneras de cambiar el rumbo de la noche.<br />Minijuegos, conexiones inesperadas y una barra a tu medida.</p><Link href="/lounge" className="night-button light">Explorar el lounge <span><LuArrowUpRight /></span></Link></div><div className="lounge-preview-art" aria-hidden="true"><div className="mini-playing-card back">x.</div><div className="mini-playing-card front"><span>THE PRIVATE COLLECTION</span><b>♡</b><em>Menos scroll.<br />Más conexión.</em><small>XTASIS · AFTER DARK</small></div></div></section>
      <section className="ritual-section"><p className="eyebrow">ASÍ DE FÁCIL. ASÍ DE DISTINTO.</p><div className="ritual-steps">{[['01', 'Reúne a tus cómplices.', 'Abre una sala o jueguen en la misma pantalla.'], ['02', 'Encuentra tu intensidad.', 'Tres ambientes. Tú decides hasta dónde.'], ['03', 'Deja que suceda.', 'Verdades, retos y conversaciones inesperadas.']].map(([n, title, copy]) => <div key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></div>)}</div><p className="night-note"><LuCheck /> Puedes pasar cualquier pregunta. Lo mejor de la noche es que todos estén a gusto.</p></section>
      <footer className="night-footer"><Link href="/" className="night-wordmark">xtasis<span>.</span></Link><p>La mejor parte de la noche es con quién la compartes.</p><span>+18 · A TU RITMO · TAMBIÉN SIN ALCOHOL</span></footer>
      <Sheet open={sheet === 'join'} onOpenChange={open => !open && setSheet(null)} title="Tu lugar está reservado" subtitle="Introduce el código de cuatro caracteres de tu anfitrión."><form onSubmit={joinRoom} className="lounge-form"><label htmlFor="room-code">Código de sala</label><input id="room-code" className="input code-input" value={code} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)); setError(''); }} placeholder="XXXX" maxLength={4} autoCapitalize="characters" autoComplete="off" autoFocus />{error && <p className="night-error" role="alert">{error}</p>}<button type="submit" className="night-button primary" disabled={busy || code.length !== 4}>{busy ? <Spinner /> : <>Entrar a la noche <LuArrowRight /></>}</button></form></Sheet>
      <SettingsSheet open={sheet === 'settings'} onOpenChange={open => !open && setSheet(null)} /><HowToSheet open={sheet === 'how'} onOpenChange={open => !open && setSheet(null)} />
    </main>
  );
}
