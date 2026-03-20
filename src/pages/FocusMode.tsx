import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { useToasts } from '../components/Toast';

export const FocusMode: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (!isMuted) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play();
    }

    if (mode === 'work') {
      addToast('Focus session complete! Take a break.');
      await fetch('/api/focus-sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ duration_minutes: 25 })
      });
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      addToast('Break over. Ready to focus?');
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-700 px-4 h-full",
      isFullscreen ? "fixed inset-0 z-[100] bg-background" : "relative"
    )}>
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] sm:h-[800px] sm:w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[100px] sm:blur-[150px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full text-center space-y-12 sm:space-y-20"
      >
        <header className="space-y-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
            <Zap className="text-white" size={24} fill="white" />
            <span className="text-sm sm:text-base font-black tracking-[0.4em] uppercase text-zinc-500">Focus Engine</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>
          <motion.h1 
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl font-bold tracking-tighter font-display text-white"
          >
            {mode === 'work' ? 'Deep Work' : 'Rest & Recharge'}
          </motion.h1>
        </header>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center group">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-white/5 scale-[1.15] sm:scale-[1.25] transition-all duration-1000 group-hover:scale-[1.3] group-hover:border-white/10" />
          
          {/* Progress Ring */}
          <svg className="h-80 w-80 sm:h-[450px] sm:w-[450px] -rotate-90 transform drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="301%"
              animate={{ strokeDashoffset: `${301 * (1 - progress / 100)}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-white"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <motion.span 
              key={timeLeft}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl sm:text-[12rem] font-bold tracking-tighter tabular-nums font-display leading-none"
            >
              {formatTime(timeLeft)}
            </motion.span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-10 sm:gap-16">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className="p-6 rounded-[2rem] bg-white/5 text-zinc-500 hover:text-white transition-all border border-white/5 shadow-xl"
          >
            {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="h-24 w-24 sm:h-32 sm:w-32 rounded-[3rem] bg-white flex items-center justify-center text-black shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all"
          >
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div key="pause" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                  <Pause size={40} sm:size={48} fill="black" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                  <Play size={40} sm:size={48} fill="black" className="ml-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-6 rounded-[2rem] bg-white/5 text-zinc-500 hover:text-white transition-all border border-white/5 shadow-xl"
          >
            <RotateCcw size={28} />
          </motion.button>
        </div>


        <div className="flex justify-center">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-all hover:tracking-[0.2em]"
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={16} />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 size={16} />
                Immersive Mode
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
