'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { LuShare2, LuDownload } from 'react-icons/lu';
import { toast } from 'sonner';
import { Btn, Spinner } from '@/components/kit/Btn';
import { Avatar } from '@/components/kit/Avatar';
import { Ticker } from '@/components/kit/Ticker';
import { AWARD_DEFS } from '@/data/party';
import { computeAwards } from '@/lib/party';
import { feel } from '@/lib/feedback';
import { PlayerSymbol } from '@/components/kit/PlayerSymbol';
import { symbolGlyph } from '@/data/symbols';

/* ── Tarjeta compartible estilo "Wrapped" (canvas 1080×1350) ── */
async function renderRecapImage({ winner, awards, stats, gameId }) {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#2a0a1c');
  bg.addColorStop(0.55, '#060204');
  bg.addColorStop(1, '#3a0d22');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  const blob = (x, y, r, col) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'transparent');
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);
  };
  blob(180, 200, 520, 'rgba(163,15,69,.6)');
  blob(940, 1150, 560, 'rgba(255,59,92,.3)');
  blob(900, 260, 320, 'rgba(255,77,109,.25)');

  const font = (w, s) => `${w} ${s}px "Bodoni Moda", Georgia, serif`;
  g.textAlign = 'center';

  g.fillStyle = '#ff3b5c';
  g.font = font(700, 34);
  g.fillText('X T A S I S   ·   L A   N O C H E', W / 2, 110);

  g.font = '210px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
  g.fillStyle = '#fff';
  g.fillText(symbolGlyph(winner?.avatar), W / 2, 410);

  g.fillStyle = '#fdeeee';
  g.font = font(900, 92);
  g.fillText((winner?.name ?? '—').toUpperCase().slice(0, 14), W / 2, 540);
  g.fillStyle = '#ff2d6f';
  g.font = font(700, 32);
  g.fillText('REY / REINA DE LA NOCHE  👑', W / 2, 600);

  const top = awards.slice(0, 4);
  top.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 70 + col * 480;
    const y = 680 + row * 250;
    g.fillStyle = 'rgba(255,255,255,.07)';
    g.strokeStyle = 'rgba(255,255,255,.18)';
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, 460, 220, 36);
    g.fill();
    g.stroke();
    g.textAlign = 'left';
    g.font = '64px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
    g.fillStyle = '#fff';
    g.fillText(symbolGlyph(a.emoji), x + 32, y + 90);
    g.fillStyle = '#ff3b5c';
    g.font = font(800, 26);
    g.fillText(a.label.toUpperCase().slice(0, 22), x + 32, y + 145);
    g.fillStyle = '#fdeeee';
    g.font = font(700, 30);
    g.fillText(a.player.name.slice(0, 18), x + 32, y + 192);
  });

  g.textAlign = 'center';
  g.fillStyle = '#c29aa0';
  g.font = font(500, 28);
  g.fillText(`${stats?.cardsPlayed ?? 0} cartas · ${stats?.skips ?? 0} "no me atrevo" · sala ${gameId ?? ''}`, W / 2, H - 70);

  return new Promise(res => c.toBlob(res, 'image/png'));
}

export function Recap({ winnerId, players, stats, missions = {}, drinks = {}, gameId, onClose }) {
  const winner = players.find(p => p.id === winnerId);
  const awards = useMemo(() => computeAwards(players, stats, AWARD_DEFS), [players, stats]);
  const [sharing, setSharing] = useState(false);
  const missionsDone = players.filter(p => missions[p.id]?.done).length;
  const totalDrinks = Object.values(drinks).reduce((s, n) => s + n, 0);

  useEffect(() => {
    feel('levelup', 'heavy');
    const end = Date.now() + 1800;
    const colors = ['#ff3b5c', '#ffe3e8', '#ff2d6f', '#ff4d6d'];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const share = async mode => {
    setSharing(true);
    try {
      await document.fonts?.ready;
      const blob = await renderRecapImage({ winner, awards, stats, gameId });
      const file = new File([blob], 'xtasis-recap.png', { type: 'image/png' });
      if (mode === 'share' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Xtasis', text: 'Así quedó nuestra noche 🔥' });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'xtasis-recap.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast.success('Tarjeta guardada');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') toast.error('No se pudo generar la tarjeta');
    }
    setSharing(false);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="panel panel-accent w-full max-w-md p-6 text-center"
        style={{ maxHeight: '94dvh', overflowY: 'auto' }}>
        <motion.div animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 3.2 }} className="text-6xl mb-1">
          👑
        </motion.div>
        <Avatar player={winner} size="xl" active className="mx-auto" />
        <h2 className="font-display text-3xl font-black uppercase mt-4 leading-none rainbow-text">{winner?.name}</h2>
        <p className="eyebrow mt-2">Última copa en pie · Rey/Reina de la noche</p>

        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            [stats?.cardsPlayed ?? 0, 'cartas'],
            [stats?.skips ?? 0, 'rendiciones'],
            [totalDrinks, 'tragos'],
          ].map(([v, l]) => (
            <div key={l} className="panel-2 py-3">
              <Ticker value={v} className="font-display text-2xl font-black" style={{ color: 'var(--accent)' }} />
              <p className="eyebrow mt-1" style={{ fontSize: '0.56rem' }}>{l}</p>
            </div>
          ))}
        </div>

        {awards.length > 0 && (
          <>
            <p className="eyebrow mt-6 mb-3">Premios de la noche</p>
            <div className="grid grid-cols-2 gap-2.5 text-left">
              {awards.map((a, i) => (
                <motion.div
                  key={a.key}
                  initial={{ opacity: 0, y: 20, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.09, type: 'spring', stiffness: 260, damping: 18 }}
                  className="panel-2" style={{ padding: '0.75rem' }}>
                  <span className="text-2xl"><PlayerSymbol symbol={a.emoji} /></span>
                  <p className="font-display text-[0.62rem] font-extrabold uppercase mt-1" style={{ color: 'var(--accent)' }}>{a.label}</p>
                  <p className="text-sm font-bold truncate"><PlayerSymbol symbol={a.player.avatar} /> {a.player.name}</p>
                  <p className="text-[0.62rem]" style={{ color: 'var(--subtle)' }}>{a.hint} · {a.value}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {Object.keys(missions).length > 0 && (
          <p className="text-xs mt-5 font-semibold" style={{ color: 'var(--muted)' }}>
            🕵️ {missionsDone} de {players.length} cumplieron su misión secreta
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-6">
          <Btn variant="cyan" onClick={() => share('share')} disabled={sharing}>
            {sharing ? <Spinner /> : <><LuShare2 size={16} /> Compartir</>}
          </Btn>
          <Btn variant="ghost" onClick={() => share('download')} disabled={sharing}>
            <LuDownload size={16} /> Guardar
          </Btn>
        </div>
        <Btn variant="acid" size="xl" full className="mt-3" onClick={onClose}>Fin de fiesta ✦</Btn>
      </motion.div>
    </main>
  );
}
