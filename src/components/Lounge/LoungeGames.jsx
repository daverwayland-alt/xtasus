'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuArrowRight, LuBookmark, LuCheck, LuRotateCcw } from 'react-icons/lu';
import { QUESTIONS, DILEMMAS, CHEMISTRY, CHEMISTRY_OPTIONS, CATEGORIES, TABOO, LOCATIONS } from '@/data/lounge';
import { shuffle, parseGuests, pairGuests } from '@/lib/lounge';
import { feel } from '@/lib/feedback';

export function Action({ children, onClick, disabled, secondary = false, type = 'button' }) {
  return <button type={type} className={`night-button ${secondary ? 'secondary' : 'primary'}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function Choices({ values, value, onChange, label }) {
  return <div className="choice-row" role="group" aria-label={label}>{values.map(item => <button type="button" className="choice" aria-pressed={value === item} key={item} onClick={() => onChange(item)}>{item}</button>)}</div>;
}
export function Prompt({ label, children, footer }) {
  return <AnimatePresence mode="wait"><motion.div className="lounge-prompt" key={String(children)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }}><span className="eyebrow">{label}</span><p>{children}</p>{footer}</motion.div></AnimatePresence>;
}
export function GuestInput({ value, onChange, min = 2 }) {
  const names = parseGuests(value);
  return <label className="field-label">Tus cómplices, separados por comas<textarea className="input lounge-textarea" value={value} onChange={e => onChange(e.target.value)} placeholder="Alex, Val, Dani, Sam" maxLength={300} /><small>{names.length} invitados · de {min} a 12 · los nombres repetidos se unen</small></label>;
}

export function Oracle({ favorites, saveFavorite, journey = false }) {
  const [mood, setMood] = useState('suave');
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(-1);
  const [stage, setStage] = useState(0);
  const activeMood = journey ? ['suave', 'cerca', 'fuego'][stage] : mood;
  const current = cards[index];
  const next = () => {
    if (index + 1 < cards.length) { setIndex(index + 1); return; }
    setCards(shuffle(QUESTIONS[activeMood])); setIndex(0); feel('reveal');
  };
  const change = value => { setMood(value); setCards([]); setIndex(-1); };
  return <div className="panel-stack">{journey ? <><div className="journey-steps">{['La chispa', 'La conexión', 'La tensión'].map((name, i) => <button key={name} aria-pressed={i === stage} onClick={() => { setStage(i); setCards([]); setIndex(-1); }}><span>0{i + 1}</span>{name}</button>)}</div><p className="helper-copy">Tres actos, diez preguntas por acto. Cambia de acto cuando todos quieran; pasar siempre está bien.</p></> : <Choices label="Intensidad de las preguntas" values={['suave', 'cerca', 'fuego']} value={mood} onChange={change} />}
    <Prompt label={journey ? `ACTO 0${stage + 1} · ${activeMood.toUpperCase()}` : 'UNA PREGUNTA. MUCHAS POSIBILIDADES.'} footer={current && <button className="save-prompt" aria-pressed={favorites.includes(current)} onClick={() => saveFavorite(current)}><LuBookmark /> {favorites.includes(current) ? 'En tu colección' : 'Guardar pregunta'}</button>}>{current || 'Las mejores conversaciones empiezan por atreverse a preguntar.'}</Prompt>
    <div className="panel-actions"><Action onClick={next}>{index === -1 ? 'Descubrir pregunta' : index === cards.length - 1 ? 'Volver a mezclar' : 'Siguiente pregunta'} <LuArrowRight /></Action>{current && <span className="helper-copy">{index + 1} / {cards.length} · sin repetir</span>}</div>
  </div>;
}

export function Chemistry() {
  const [phase, setPhase] = useState('intro');
  const [a, setA] = useState([]);
  const [b, setB] = useState([]);
  const [step, setStep] = useState(0);
  const reset = () => { setA([]); setB([]); setStep(0); setPhase('intro'); };
  const answer = value => {
    if (phase === 'a') setA([...a, value]); else setB([...b, value]);
    if (step === CHEMISTRY.length - 1) { setStep(0); setPhase(phase === 'a' ? 'handoff' : 'result'); } else setStep(step + 1);
  };
  const matches = a.filter((v, i) => v === b[i]).length;
  if (phase === 'intro') return <div className="panel-stack"><Prompt label="DOS PERSONAS · CINCO DECISIONES">¿En la misma frecuencia?</Prompt><p>La primera persona responde y pasa el celular. La segunda elige sin ver las respuestas. Es un juego de coincidencias, no una medida de compatibilidad.</p><Action onClick={() => setPhase('a')}>Persona 1 · empezar <LuArrowRight /></Action></div>;
  if (phase === 'handoff') return <div className="panel-stack"><Prompt label="UN PEQUEÑO MISTERIO">Pasa el celular a la segunda persona.</Prompt><Action onClick={() => setPhase('b')}>Soy la persona 2. Vamos.</Action></div>;
  if (phase === 'result') return <div className="panel-stack"><div className="big-score">{matches}<span>/ 5</span></div><h3>{matches >= 3 ? 'Hay cosas que fluyen solas.' : 'Las diferencias también tienen encanto.'}</h3>{CHEMISTRY.map((q, i) => <div className="result-row" key={q}><span>{q}<small>{a[i]} / {b[i]}</small></span>{a[i] === b[i] ? <LuCheck /> : '—'}</div>)}<Action secondary onClick={reset}><LuRotateCcw /> Otra pareja</Action></div>;
  return <div className="panel-stack"><p className="eyebrow">PERSONA {phase === 'a' ? '1' : '2'} · {step + 1} DE 5</p><progress className="night-progress" value={step} max={5} aria-label="Preguntas respondidas" /><Prompt label="ELIGE SIN PENSARLO DEMASIADO">{CHEMISTRY[step]}</Prompt>{CHEMISTRY_OPTIONS[step].map(option => <Action secondary key={option} onClick={() => answer(option)}>{option} <LuArrowRight /></Action>)}</div>;
}

export function Dilemma() {
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState(4);
  const [votes, setVotes] = useState([]);
  const [handoff, setHandoff] = useState(false);
  const done = votes.length === players;
  const count = votes.filter(v => v === 0).length;
  return <div className="panel-stack"><label className="field-label">Personas en la mesa<select className="input" value={players} onChange={e => { setPlayers(+e.target.value); setVotes([]); setHandoff(false); }}>{Array.from({ length: 11 }, (_, i) => <option key={i} value={i + 2}>{i + 2} personas</option>)}</select></label><p className="eyebrow">RONDA {round + 1} · {done ? 'EL VEREDICTO' : `VOTA LA PERSONA ${votes.length + 1}`}</p>{handoff && !done ? <><Prompt label="VOTO REGISTRADO">Pasa el celular a la siguiente persona.</Prompt><Action onClick={() => setHandoff(false)}>Listo para votar</Action></> : <div className="dilemma-options">{DILEMMAS[round % DILEMMAS.length].map((option, i) => <button key={option} disabled={done} onClick={() => { setVotes([...votes, i]); setHandoff(true); }}><span>{i ? 'B' : 'A'}</span><strong>{option}</strong>{done && <><b>{Math.round((i === 0 ? count : players - count) / players * 100)}%</b><small>{i === 0 ? count : players - count} votos</small></>}</button>)}</div>}{done && <Action onClick={() => { setRound(round + 1); setVotes([]); setHandoff(false); }}>Otra tentación <LuArrowRight /></Action>}<small className="helper-copy">Votos ocultos hasta que toda la mesa haya decidido.</small></div>;
}

export function Roulette() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('Protagonista');
  const [used, setUsed] = useState([]);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const names = parseGuests(input);
  function spin() {
    setSpinning(true); setResult(null);
    timer.current = setTimeout(() => {
      if (mode === 'Parejas') setResult(pairGuests(names).map(pair => pair.join(' & ')));
      else {
        const pool = names.filter(n => !used.includes(n));
        const chosen = shuffle(pool.length ? pool : names)[0];
        setResult([chosen]); setUsed(pool.length ? [...used, chosen] : [chosen]);
      }
      setSpinning(false); feel('reveal');
    }, 900);
  }
  return <div className="panel-stack"><GuestInput value={input} onChange={value => { setInput(value); setUsed([]); setResult(null); }} /><Choices label="Tipo de sorteo" values={['Protagonista', 'Parejas']} value={mode} onChange={value => { setMode(value); setResult(null); }} /><div className={`destiny-orb ${spinning ? 'spinning' : ''}`} aria-hidden="true">✳</div><div role="status" className="roulette-result">{result ? result.map(r => <p key={r}>{r}</p>) : <p>{spinning ? 'El destino está eligiendo…' : 'Que decida el azar.'}</p>}</div><Action disabled={names.length < 2 || spinning} onClick={spin}>Invocar al destino <LuArrowRight /></Action><small className="helper-copy">El protagonista no se repite hasta que todos salgan. Si hay un número impar, se forma un trío.</small></div>;
}

export function Spy() {
  const [input, setInput] = useState('');
  const [game, setGame] = useState(null);
  const [person, setPerson] = useState(0);
  const [show, setShow] = useState(false);
  const [end, setEnd] = useState(false);
  const names = parseGuests(input);
  function start() { setGame({ names, spy: shuffle(names)[0], place: shuffle(LOCATIONS)[0] }); setPerson(0); setShow(false); setEnd(false); }
  if (!game) return <div className="panel-stack"><GuestInput min={3} value={input} onChange={setInput} /><p>Todos verán el mismo lugar, excepto el infiltrado. Pasen el celular para ver su rol en secreto; después hagan preguntas y voten en voz alta.</p><Action disabled={names.length < 3} onClick={start}>Repartir identidades</Action></div>;
  if (end) return <div className="panel-stack"><Prompt label="LA IDENTIDAD REVELADA">{game.spy} era el infiltrado.</Prompt><p className="centered">El lugar era: <strong>{game.place}</strong></p><Action onClick={start}>Nueva ronda</Action><Action secondary onClick={() => setGame(null)}>Cambiar invitados</Action></div>;
  if (person >= game.names.length) return <div className="panel-stack"><Prompt label="COMIENZA LA INVESTIGACIÓN">Alguien en esta mesa está improvisando.</Prompt><p>Por turnos hagan una pregunta sobre el lugar, sin nombrarlo. Después de dos vueltas, señalen al sospechoso. El infiltrado puede intentar adivinar el lugar antes del veredicto.</p><Action onClick={() => setEnd(true)}>Revelar al infiltrado</Action></div>;
  const name = game.names[person];
  return <div className="panel-stack"><p className="eyebrow">IDENTIDAD {person + 1} DE {game.names.length}</p><Prompt label={`SOLO PARA ${name.toUpperCase()}`}>{show ? name === game.spy ? 'Eres el infiltrado. Escucha, improvisa y evita que te descubran.' : `El lugar es: ${game.place}. No lo digas en voz alta.` : `Pasa el celular a ${name}.`}</Prompt>{show ? <Action onClick={() => { setShow(false); setPerson(person + 1); }}>Ocultar y pasar</Action> : <Action onClick={() => setShow(true)}>Soy {name} · ver mi rol</Action>}</div>;
}

function useCountdown() {
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (deadline === null) return;
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [deadline]);
  return { remaining, start(seconds) { setRemaining(seconds); setDeadline(Date.now() + seconds * 1000); }, stop() { setDeadline(null); setRemaining(null); } };
}

export function FiveSeconds() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [played, setPlayed] = useState(0);
  const timer = useCountdown();
  const finish = win => { setScore(score + (win ? 1 : 0)); setPlayed(played + 1); setIndex((index + 1) % CATEGORIES.length); timer.stop(); };
  return <div className="panel-stack"><div className="score-line"><span>RONDA {played + 1}</span><span>{score} puntos</span></div><Prompt label="NOMBRA SIN REPETIR">{CATEGORIES[index]}</Prompt><div className={`big-score ${timer.remaining === 0 ? 'time-up' : ''}`} role="timer">{timer.remaining ?? '05'}<span>s</span></div>{timer.remaining === null ? <Action onClick={() => timer.start(5)}>Arrancar el reloj</Action> : <><p role="status" className="centered">{timer.remaining === 0 ? 'Tiempo. ¿Lograste decir las tres?' : 'La mesa valida las respuestas.'}</p><div className="panel-actions"><Action onClick={() => finish(true)}>Lo logré +1</Action><Action secondary onClick={() => finish(false)}>Pasar</Action></div></>}<small className="helper-copy">Una respuesta correcta debe incluir tres elementos distintos. Puntaje de esta sesión.</small></div>;
}

export function Taboo() {
  const [cards, setCards] = useState(() => TABOO);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [team, setTeam] = useState(0);
  const timer = useCountdown();
  const playing = timer.remaining !== null && timer.remaining > 0;
  function next(win) { if (win) setScores(s => s.map((score, i) => i === team ? score + 1 : score)); setIndex(i => (i + 1) % cards.length); }
  return <div className="panel-stack"><div className="team-score"><span className={team === 0 ? 'selected' : ''}>Equipo A <b>{scores[0]}</b></span><span className={team === 1 ? 'selected' : ''}>Equipo B <b>{scores[1]}</b></span></div>{playing ? <><p className="eyebrow">DESCRIBE SIN DECIR</p><div className="taboo-card"><h3>{cards[index].word}</h3>{cards[index].banned.map(word => <span key={word}>{word}</span>)}</div><div className="panel-actions"><Action onClick={() => next(true)}>Adivinada +1</Action><Action secondary onClick={() => next(false)}>Pasar</Action></div></> : <><Prompt label={timer.remaining === 0 ? 'SE ACABÓ EL TIEMPO' : 'DOS EQUIPOS · 45 SEGUNDOS'}>{timer.remaining === 0 ? 'Cambio de equipo. ¿Quién toma la palabra?' : 'Algunas palabras es mejor no decirlas.'}</Prompt><Action onClick={() => { if (timer.remaining === 0) setTeam(1 - team); setCards(shuffle(TABOO)); setIndex(0); timer.start(45); }}>Turno del equipo {timer.remaining === 0 ? team === 0 ? 'B' : 'A' : team === 0 ? 'A' : 'B'}</Action></>}<p className="timer-readout" role="timer">{timer.remaining ?? 45}s</p><small className="helper-copy">Solo la persona que describe mira la pantalla. Si dice una palabra prohibida, pasa la carta.</small></div>;
}
