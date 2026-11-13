'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { levels, getRandomCard } from '@/data/cards';
import { FaPlay, FaLock, FaDice, FaCoffee, FaFire } from 'react-icons/fa';

import { BackgroundOrbs } from '@/components/UI/BackgroundOrbs';
import { GlassCard } from '@/components/UI/GlassCard';

export default function GameClient({ gameId }) {
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerId, setPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);

  // UI states
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Initial check & polling
  useEffect(() => {
    setPlayerId(sessionStorage.getItem('playerId') || '');
    setIsHost(sessionStorage.getItem('isHost') === 'true');

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/game/${gameId}`);
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setGame(prevGame => {
          const prev = JSON.stringify(prevGame);
          const next = JSON.stringify(data);
          return prev === next ? prevGame : data;
        });

        // If game ended or returned to lobby
        if (data.status === 'lobby') {
          router.push(`/lobby/${gameId}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();

    const interval = setInterval(fetchGame, 1500);
    return () => clearInterval(interval);
  }, [gameId]);

  const handleNextTurn = async () => {
    if (!game || !game.players.length) return;

    // Randomly select next player
    const available = game.players.filter(p => p.id !== game.currentTurnPlayerId);
    const nextPlayer = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : game.players[0];

    try {
      await fetch(`/api/game/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          updates: {
            currentTurnPlayerId: nextPlayer.id,
            currentCard: null,
          },
        }),
      });
      setShowCard(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrawCard = async type => {
    if (!game) return;
    const playerNames = game.players.map(p => p.name);
    const currentPlayerName = game.players.find(p => p.id === game.currentTurnPlayerId)?.name;

    setIsSpinning(true);

    // Simulate roulette delay
    setTimeout(async () => {
      const card = getRandomCard(game.currentLevel, type, playerNames, currentPlayerName, game.playedCards || []);

      try {
        // Ensure we track this card as played so it's not repeated
        const newPlayedCards = [...(game.playedCards || []), card.id];

        await fetch(`/api/game/${gameId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            updates: {
              currentCard: card,
              playedCards: newPlayedCards,
            },
          }),
        });
        setIsSpinning(false);
        setShowCard(true);
      } catch (err) {
        console.error(err);
        setIsSpinning(false);
      }
    }, 1500); // 1.5s spinning delay
  };

  const handleChangeLevel = async levelId => {
    if (!isHost || !game) return;
    try {
      await fetch(`/api/game/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          updates: { currentLevel: levelId },
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !game)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary"></span>
      </div>
    );

  const activePlayer = game.players.find(p => p.id === game.currentTurnPlayerId) || game.players[0];
  const isMyTurn = activePlayer?.id === playerId;
  const currentLevelInfo = levels.find(l => l.id === game.currentLevel) || levels[0];

  // If no turn is set, let host start it
  if (!game.currentTurnPlayerId && isHost) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <BackgroundOrbs levelColor={currentLevelInfo.color} />
        <h2 className="text-3xl text-white mb-8 title-main md:text-5xl text-center relative z-10">Todo está listo...</h2>
        <button
          onClick={handleNextTurn}
          className="btn glass-panel border-pink-500 font-bold text-white text-xl h-20 w-full max-w-sm rounded-[24px] relative z-10 transition-transform hover:scale-105">
          Sortear Primer Turno
        </button>
      </div>
    );
  } else if (!game.currentTurnPlayerId && !isHost) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <BackgroundOrbs levelColor={currentLevelInfo.color} />
        <p className="text-white text-xl animate-pulse relative z-10">Host está decidiendo el destino...</p>
      </div>
    );
  }

  return (
    <div
      className="w-dvw flex-1 min-h-[100vh] p-4 flex flex-col items-center relative overflow-hidden transition-all duration-700"
      style={{ backgroundColor: `${currentLevelInfo.color}10` }}>
      <BackgroundOrbs levelColor={currentLevelInfo.color} />

      <div className="w-full max-w-2xl relative z-10 flex flex-col h-full gap-4 pb-10">
        {/* Header: Levels & Players */}
        <div className="flex justify-between items-start gap-4 mb-4">
          {/* Level Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
              {levels.map(level => {
                const isActive = game.currentLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => handleChangeLevel(level.id)}
                    disabled={!isHost || (!game.unlockedDrinkity && level.locked)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'}`}
                    style={{
                      backgroundColor: isActive ? level.color : 'transparent',
                      boxShadow: isActive ? `0 0 15px ${level.shadow}` : 'none',
                      border: `1px solid ${isActive ? 'transparent' : level.color}`,
                    }}
                    title={level.name}>
                    <span className="font-bold text-white">{level.locked && !game.unlockedDrinkity ? <FaLock size={12} /> : level.id}</span>
                  </button>
                );
              })}
            </div>
            <p
              className="text-sm font-semibold tracking-wider uppercase pl-2"
              style={{ color: currentLevelInfo.color }}>
              {currentLevelInfo.name}
            </p>
          </div>
        </div>

        {/* Main Play Area */}
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {!game.currentCard ? (
              <motion.div
                key="turn-selector"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center w-full">
                <div className="text-center mb-10">
                  <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-sm mb-2">Turno de</p>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{activePlayer?.avatar}</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase title-main mt-4">{activePlayer?.name}</h2>
                  </div>
                </div>

                {isMyTurn ? (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0px 0px 20px rgba(236,72,153,0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSpinning}
                      onClick={() => handleDrawCard('truth')}
                      className="relative h-28 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink-500/20 to-pink-900/20 border border-pink-500/30 overflow-hidden group backdrop-blur-md">
                      <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-3xl text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                        <FaCoffee />
                      </span>
                      <span className="font-bold text-white tracking-widest text-sm z-10">VERDAD</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0px 0px 20px rgba(168,85,247,0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSpinning}
                      onClick={() => handleDrawCard('dare')}
                      className="relative h-28 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500/20 to-purple-900/20 border border-purple-500/30 overflow-hidden group backdrop-blur-md">
                      <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-3xl text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                        <FaFire />
                      </span>
                      <span className="font-bold text-white tracking-widest text-sm z-10">RETO</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0px 0px 20px rgba(234,179,8,0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSpinning}
                      onClick={() => handleDrawCard('random')}
                      className="relative h-16 col-span-2 rounded-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border border-yellow-500/30 overflow-hidden group backdrop-blur-md">
                      <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <FaDice className="text-2xl text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] group-hover:rotate-180 transition-transform duration-500 z-10" />
                      <span className="font-bold text-white tracking-widest text-sm z-10">ALEATORIO</span>
                    </motion.button>

                    {isSpinning && (
                      <div className="col-span-2 text-center mt-4 h-8">
                        <span className="loading loading-bars loading-md text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel bg-black/40 p-6 rounded-[24px] text-center mt-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <span className="loading loading-ring loading-md mb-2 text-pink-500"></span>
                    <p className="text-gray-300 animate-pulse text-lg font-medium tracking-wide">
                      Esperando a que <span className="text-white font-bold">{activePlayer?.name}</span> decida su destino...
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="card-display"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                className="w-full max-w-sm w-full mx-auto pb-10">
                <GlassCard
                  tilt={true}
                  glowColor={`${currentLevelInfo.color}80`}
                  className="relative p-8 min-h-[400px] flex flex-col items-center justify-center text-center"
                  style={{
                    boxShadow: `0 0 40px ${currentLevelInfo.shadow}, inset 0 0 20px ${currentLevelInfo.shadow}`,
                    borderColor: `${currentLevelInfo.color}50`,
                  }}>
                  <div className="absolute top-4 left-4 p-2 rounded-full border border-white/20 bg-black/40">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">{game.currentCard.type === 'truth' ? 'Verdad' : 'Reto'}</span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="text-white text-3xl opacity-20">{activePlayer?.avatar}</span>
                  </div>

                  <div className="my-auto z-10 py-10 w-full">
                    <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed drop-shadow-md">{game.currentCard.text}</p>
                  </div>

                  <div className="absolute bottom-4 inset-x-0 text-center opacity-30 text-white font-bold tracking-[0.3em] uppercase title-main text-2xl">Xr</div>
                </GlassCard>

                {/* Controls Next Turn */}
                {(isHost || isMyTurn) && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="btn mt-8 w-full border-none font-bold text-lg h-16 rounded-[20px] shadow-lg text-white"
                    style={{ background: currentLevelInfo.color }}
                    onClick={handleNextTurn}>
                    Siguiente Turno
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
