'use client';

import { GoGear } from 'react-icons/go';
import { FaFire } from 'react-icons/fa';
import { BiDrink } from 'react-icons/bi';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundOrbs } from '@/components/UI/BackgroundOrbs';
import { GlassCard } from '@/components/UI/GlassCard';
import confetti from 'canvas-confetti';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f05', '#faa', '#a855f7'],
    });
  };

  const handleCreateGame = async () => {
    setLoading(true);
    triggerConfetti();
    try {
      const res = await fetch('/api/game', { method: 'POST' });
      if (!res.ok) throw new Error('Error al crear sala');
      const data = await res.json();
      setTimeout(() => router.push(`/lobby/${data.id}`), 800);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleJoinGame = e => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 4) {
      setError('El código debe tener 4 caracteres');
      return;
    }
    router.push(`/lobby/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="w-dvw flex-1 relative overflow-hidden">
      <BackgroundOrbs levelColor="#ec4899" />

      <div className="flex items-center justify-center flex-col w-full relative z-10 min-h-[85vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-10 w-full flex justify-center mb-16 relative">
          <motion.h1 className="text-[7em] md:text-[12em] text-center title-main leading-none z-10 relative cursor-default text-rose-500">Xtasis</motion.h1>
        </motion.div>

        <div className="w-full max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-5">
            <GlassCard
              tilt={true}
              glowColor="rgba(236,72,153,0)"
              className="col-span-2 cursor-pointer group">
              <div
                onClick={handleCreateGame}
                className="flex w-full h-32 md:h-40 flex-row items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FaFire
                  className="text-6xl md:text-7xl mr-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
                  style={{ color: '#f05', filter: 'drop-shadow(0 0 15px rgba(255,0,85,0))' }}
                />
                <p className="text-3xl md:text-4xl font-bold tracking-wider text-white">Jugar</p>
                {loading && <span className="loading loading-spinner text-secondary absolute right-8"></span>}
              </div>
            </GlassCard>

            <GlassCard
              tilt={true}
              glowColor="rgba(236,72,153,0)">
              <div
                onClick={() => setShowJoinModal(true)}
                className="cursor-pointer flex flex-col items-center justify-center py-8 group relative overflow-hidden">
                <BiDrink
                  className="text-5xl md:text-6xl mb-3 transform group-hover:-translate-y-2 group-hover:rotate-[-10deg] transition-all duration-300"
                  style={{ color: '#f05', filter: 'drop-shadow(0 0 15px rgba(255,0,85,0.7))' }}
                />
                <p className="text-xl md:text-2xl font-bold tracking-wide text-white">Unirse</p>
              </div>
            </GlassCard>

            <GlassCard
              tilt={true}
              glowColor="rgba(236,72,153,0)">
              <div className="cursor-pointer flex flex-col items-center justify-center py-8 group relative overflow-hidden">
                <GoGear
                  className="text-5xl md:text-6xl mb-3 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500"
                  style={{ color: '#f05' }}
                />
                <p className="text-xl md:text-2xl font-bold tracking-wide text-gray-300 group-hover:text-white transition-colors">Ajustes</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm">
              <GlassCard className="p-8 relative flex flex-col items-center border border-pink-500/30">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white pb-1 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                  ✕
                </button>

                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Unirse a la Magia</h2>

                <form
                  onSubmit={handleJoinGame}
                  className="w-full flex flex-col gap-4">
                  <div className="form-control">
                    <input
                      type="text"
                      placeholder="CÓDIGO"
                      maxLength={4}
                      value={joinCode}
                      onChange={e => {
                        setJoinCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className="input bg-black/40 border border-white/10 text-center text-3xl font-mono tracking-[0.25em] h-16 w-full uppercase focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all rounded-xl text-white placeholder-gray-600"
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

                  <button
                    type="submit"
                    className="btn border-none bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg h-14 rounded-xl mt-2 w-full hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all">
                    Entrar
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
