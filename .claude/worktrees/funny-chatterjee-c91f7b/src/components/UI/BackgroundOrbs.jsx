import { motion } from 'motion/react';
import React from 'react';

export const BackgroundOrbs = ({ levelColor = '#a855f7' }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
             {/* Base dark backdrop */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Primary animated orb */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px]"
                style={{ backgroundColor: levelColor }} 
            />
            
            {/* Secondary complementary orb */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1],
                    rotate: [0, -90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-700 rounded-full blur-[150px]" 
            />

            {/* Subtle grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
        </div>
    );
};
