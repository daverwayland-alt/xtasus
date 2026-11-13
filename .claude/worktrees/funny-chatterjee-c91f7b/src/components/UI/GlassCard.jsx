'use client';
import { motion, useMotionValue, useTransform } from 'motion/react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export const GlassCard = ({ children, className, tilt = false, glowColor = 'rgba(255,255,255,0.1)' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Subtle 3D tilt calculations
  const rotateX = useTransform(y, [-100, 100], [tilt ? 8 : 0, tilt ? -8 : 0]);
  const rotateY = useTransform(x, [-100, 100], [tilt ? -8 : 0, tilt ? 8 : 0]);

  // Glow position calculation (Hoisted hooks)
  const glowX = useTransform(x, val => val);
  const glowY = useTransform(y, val => val);

  function handleMouse(event) {
    if (!tilt) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 4);
    y.set(event.clientY - rect.top - rect.height / 4);
  }

  return (
    <motion.div
      style={{}}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
      className={cn(
        'relative rounded-3xl overflow-hidden border border-white/10',
        'bg-gradient-to-br from-white/[0.05] to-white/[0.01]',
        'backdrop-blur-[9px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
        'transition-colors duration-500',
        className,
      )}>
      {/* Dynamic Glow Cursor Effect */}
      {tilt && isHovered && (
        <motion.div
          className="absolute pointer-events-none rounded-full blur-[80px]"
          style={{
            background: glowColor,
            width: '200px',
            height: '200px',
            x: glowX,
            y: glowY,
            opacity: 0.6,
          }}
        />
      )}

      {/* Glossy top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />

      <div
        className="relative z-10"
        style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </motion.div>
  );
};
