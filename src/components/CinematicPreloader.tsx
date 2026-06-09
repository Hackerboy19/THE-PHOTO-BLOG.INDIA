import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Camera, Cpu, Sparkles } from 'lucide-react';

interface CinematicPreloaderProps {
  onComplete: () => void;
}

export default function CinematicPreloader({ onComplete }: CinematicPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('BOOTING LIVE ENVIRONMENT...');
  const [mounted, setMounted] = useState(true);

  // Status message sequence matching cinematic branding
  const statusMessages = [
    { threshold: 0, text: 'SYNCHRONIZING REPOSITORY...' },
    { threshold: 18, text: 'CALIBRATING OPTICAL PROFILES...' },
    { threshold: 35, text: 'CACHING HIGH-FIDELITY RAW SHUTTERS...' },
    { threshold: 55, text: 'COMPUTING CINEMATIC COLOR ENGINES...' },
    { threshold: 72, text: 'PRE-LOADING GRAPHIC DESIGN ASSETS...' },
    { threshold: 88, text: 'MASTERNODE SYNDICATION ONLINE...' },
    { threshold: 98, text: 'READY' }
  ];

  useEffect(() => {
    // Elegant simulation of progress calculation that stays visually interesting
    let timer: NodeJS.Timeout;
    const start = Date.now();
    const duration = 2400; // 2.4 seconds loading time

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      const computed = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setProgress(computed);

      // Select status text
      const matchingStatus = statusMessages
        .slice()
        .reverse()
        .find(msg => computed >= msg.threshold);
      
      if (matchingStatus) {
        setStatusText(matchingStatus.text);
      }

      if (computed < 100) {
        timer = setTimeout(updateProgress, 30 + Math.random() * 20);
      } else {
        // Hold for a moment on 100% for smooth transition
        setTimeout(() => {
          setMounted(false);
          setTimeout(onComplete, 800); // Allow exit animations to finish
        }, 500);
      }
    };

    updateProgress();

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[#040404] text-[#F5F5F5] p-6 sm:p-12 md:p-16 select-none font-mono"
        >
          {/* Subtle noise and scanline overlays */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />
          
          {/* 1. Header Metadata indicators */}
          <div className="flex justify-between items-start text-[10px] text-zinc-500 tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FFDA03] rounded-full animate-ping" />
              <span>TPB.SYSTEMS // LIVE</span>
            </div>
            <div className="text-right">
              <div>SYS_COORD: 26.9124° N, 75.7873° E</div>
              <div className="text-zinc-500">JAIPUR - GLOBAL HUB</div>
            </div>
          </div>

          {/* 2. Central Cinematic Logo branding Reveal */}
          <div className="flex flex-col items-center justify-center text-center py-20">
            {/* Elegant Outer Ring Ring border animation */}
            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
              <motion.div 
                initial={{ rotate: 0, scale: 0.8 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-dashed border-[#FFDA03]/30"
              />
              <motion.div 
                initial={{ rotate: 360, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
                className="absolute inset-2 rounded-full border border-dotted border-white/10"
              />
              
              {/* Central Iconic aperture lines */}
              <div className="relative w-16 h-16 bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                <Camera className="w-6 h-6 text-[#FFEEB7]" />
                
                {/* Horizontal scanner light bar */}
                <div className="absolute inset-x-0 h-[1.5px] bg-[#FFDA03]/80 shadow-[0_0_8px_#FFDA03] animate-laser" />
              </div>

              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-zinc-600" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-zinc-600" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-zinc-600" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-zinc-600" />
            </div>

            {/* Split Reveal style typography for TPB.INDIA */}
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl font-serif text-white uppercase italic tracking-normal"
              >
                TPB<span className="text-[#FFDA03] font-sans font-light not-italic">.</span>INDIA
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-[10px] tracking-[0.3em] text-[#FFEEB7] font-mono uppercase mt-3"
            >
              JAIPUR ROOTED. GROWING GLOBALLY.
            </motion.p>
          </div>

          {/* 3. Bottom Dynamic Loading Progress and Calibrating Coordinates */}
          <div className="space-y-6 max-w-xl mx-auto w-full">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">STATUS CONSOLE</span>
                <span className="text-[#FFDA03] text-xs uppercase tracking-wider block font-sans font-medium h-4">
                  {statusText}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif text-white italic font-normal">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Custom high-end linear progress bar alignment */}
            <div className="relative h-[2px] bg-white/5 overflow-hidden">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FFDA03] to-[#FFEEB7]"
                style={{ width: `${progress}%` }}
              />
              {/* Scanner pulse marker at the edge of the progress line */}
              <motion.div 
                className="absolute h-full w-6 bg-white/50 blur-[2px]"
                style={{ left: `calc(${progress}% - 24px)` }}
              />
            </div>

            {/* Bottom auxiliary metadata row */}
            <div className="flex justify-between text-[8px] text-zinc-600 tracking-widest uppercase pt-2 font-mono">
              <span>M.Sc ENTREPRENEURSHIP & INNOVATION MANAGEMENT</span>
              <span>© MUSKAN MUNDHRA BRANDING ARCHIVE</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
