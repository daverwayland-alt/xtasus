'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { FaUserPlus, FaPlay, FaCopy } from 'react-icons/fa';
import { levels } from '@/data/cards';
import { BackgroundOrbs } from '@/components/UI/BackgroundOrbs';
import { GlassCard } from '@/components/UI/GlassCard';

const AVATARS = ['😎', '🥵', '😈', '👽', '👻', '🤡', '🐱', '🦄', '💀', '🔥', '💋', '🍑'];

export default function LobbyClient({ gameId }) {
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Player details
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState(AVATARS[0]);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Initial check
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/game/${gameId}`);
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setGame(data);

        // If game already started, move to game page
        if (data.status === 'playing') {
          router.push(`/game/${gameId}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  // Polling only if joined
  useEffect(() => {
    if (!isJoined || !gameId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/game/${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setGame(prevGame => {
          const previous = JSON.stringify(prevGame);
          const next = JSON.stringify(data);
          return previous === next ? prevGame : data;
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isJoined, gameId]);

  const handleJoin = async e => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/game/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          player: { name: playerName, avatar: playerAvatar },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al unirse');
        return;
      }

      // Success
      setIsJoined(true);
      setGame(data.game);
      // Salvar al jugador actual en local storage o memory (simplificado para demo: solo estado local "isJoined")
      // ideally we would save playerId in sessionStorage to identify the current user.
      sessionStorage.setItem('playerId', data.player.id);
      sessionStorage.setItem('playerName', data.player.name);
      sessionStorage.setItem('isHost', data.player.isHost ? 'true' : 'false');
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!game || game.players.length < 2) return;
    try {
      await fetch(`/api/game/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          updates: { status: 'playing' },
        }),
      });
      // Polling will redirect us
    } catch (error) {
      console.error('Error starting game', error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );

  const isHost = sessionStorage.getItem('isHost') === 'true';

  return (
    <div className="w-dvw flex-1 min-h-[90vh] p-4 flex flex-col items-center">
      <BackgroundOrbs levelColor="#f05" />

      <div className="w-full max-w-2xl relative z-10">
        <GlassCard className="p-6 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">Código de Sala</h2>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={copyCode}>
              <h1 className="text-4xl md:text-5xl font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-bold">{gameId}</h1>
              <button className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/10">
                {copied ? <span className="text-green-400 text-xs font-bold uppercase">Copiado</span> : <FaCopy size={18} />}
              </button>
            </div>
          </div>
        </GlassCard>

        {!isJoined ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                <FaUserPlus className="text-pink-500" />
                Prepara tu Perfil
              </h2>

              <form
                onSubmit={handleJoin}
                className="relative z-10 space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300 font-medium">Avatar de la Noche</span>
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                    {AVATARS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPlayerAvatar(emoji)}
                        className={`text-3xl w-12 h-12 rounded-lg flex items-center justify-center transition-all ${playerAvatar === emoji ? 'bg-white/20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'hover:bg-white/10 hover:scale-105'}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-300 font-medium">Tu Nombre (Alias)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={playerName}
                    onChange={e => {
                      setPlayerName(e.target.value);
                      setError('');
                    }}
                    className="input bg-black/50 border border-white/10 focus:border-pink-500 h-14 text-xl mt-1 text-white placeholder-gray-600 rounded-xl w-full transition-colors"
                    placeholder="Ej. Diablo24"
                  />
                  {error && <p className="text-red-400 mt-2 text-sm font-medium">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={joining || !playerName}
                  className="btn w-full h-14 border-none bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all">
                  {joining ? <span className="loading loading-spinner"></span> : 'Entrar a la Sala'}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-white">
                <span>Jugadores ({game?.players?.length || 0})</span>
                {game?.players?.length < 2 && <span className="text-sm font-normal text-pink-400">Esperando...</span>}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {game?.players?.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-3xl bg-black/50 w-10 h-10 rounded-lg flex items-center justify-center">{p.avatar}</span>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-white truncate max-w-full">{p.name}</span>
                      {p.isHost && <span className="text-[10px] text-pink-500 uppercase tracking-widest font-bold">Host</span>}
                    </div>
                  </div>
                ))}
                {/* Empty placeholders */}
                {game?.players?.length < 4 &&
                  Array.from({ length: 4 - game.players.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 border-dashed opacity-50">
                      <div className="w-10 h-10 rounded-lg bg-black/50 animate-pulse"></div>
                      <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  ))}
              </div>
            </GlassCard>

            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={game?.players?.length < 2}
                className="btn w-full h-16 border-none bg-gradient-to-r from-pink-600 to-purple-600 disabled:opacity-50 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(236,72,153,0.4)] disabled:shadow-none transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 ease-out" />
                <FaPlay className="mr-2" />
                {game?.players?.length < 2 ? 'Faltan Jugadores' : 'COMENZAR LA NOCHE'}
              </button>
            ) : (
              <div className="glass-panel p-6 text-center border border-pink-500/30">
                <p className="text-gray-300 animate-pulse text-lg font-medium">Esperando a que el host inicie el juego...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
