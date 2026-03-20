import React from 'react';
import { motion } from 'motion/react';
import { Button } from './components/Button';

export const LandingPage: React.FC<{ onStart: () => void; onLogin: () => void }> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-6">
      <div className="noise opacity-20" />
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-purple/5 blur-[180px] animate-pulse" />
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] bg-accent-blue/5 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] bg-accent-purple/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(30px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8 w-full max-w-7xl relative z-10"
      >
        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="text-[22vw] font-black tracking-tighter font-display leading-[0.75] uppercase select-none text-center purple-gradient-text glow-text-purple"
          >
            AXION
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.6em" }}
            transition={{ delay: 1.5, duration: 2 }}
            className="text-[10px] md:text-xs font-black uppercase text-zinc-500 mt-4 text-center"
          >
            Defy Gravity. Master Productivity.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="mt-8"
        >
          <Button 
            onClick={onStart} 
            size="lg" 
            className="px-16 py-8 rounded-full text-xl font-bold uppercase tracking-[0.3em] bg-white text-black hover:bg-accent-purple hover:text-white transition-all duration-500 shadow-2xl shadow-purple-500/20 group relative overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Ambient particles (CSS only) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
