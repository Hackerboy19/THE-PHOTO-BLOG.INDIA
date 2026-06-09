import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchCode, HelpCircle } from 'lucide-react';

interface ZoomableLightboxImageProps {
  src: string;
  alt: string;
}

export default function ZoomableLightboxImage({ src, alt }: ZoomableLightboxImageProps) {
  const [zoomState, setZoomState] = useState({ x: 0, y: 0, isHovered: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the element, clamped to bounds
    const xVal = Math.max(0, Math.min(width, e.clientX - left));
    const yVal = Math.max(0, Math.min(height, e.clientY - top));
    
    // Convert to percentage
    const xPercent = (xVal / width) * 100;
    const yPercent = (yVal / height) * 100;

    setZoomState({
      x: xPercent,
      y: yPercent,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setZoomState(prev => ({ ...prev, isHovered: false }));
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in bg-black/40 group border border-white/5"
      id="zoom-container"
    >
      {/* Visual Instruction Badge */}
      <AnimatePresence>
        {!zoomState.isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-black/80 border border-white/10 px-3 py-1.5 font-mono text-[9px] text-zinc-400 tracking-wider uppercase pointer-events-none"
          >
            <SearchCode className="w-3.5 h-3.5 text-[#FFEEB7] animate-pulse" />
            <span>Hover Image to Inspect Details [2.0X]</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Zoom Coordinates Status Indicator */}
      <AnimatePresence>
        {zoomState.isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-30 font-mono text-[9px] bg-black/90 border border-[#FFEEB7]/30 px-2.5 py-1 text-zinc-400 pointer-events-none flex gap-3"
          >
            <span className="text-[#FFEEB7]">✦ RESOLUTION DETECTED</span>
            <span>X: {zoomState.x.toFixed(0)}%</span>
            <span>Y: {zoomState.y.toFixed(0)}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid overlay lines that dynamically react to hover state */}
      <div 
        className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-20 transition-opacity duration-300 ${
          zoomState.isHovered ? 'opacity-40' : 'opacity-10'
        }`}
      />

      {/* Frame Corners for Brutalist Luxury detail */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none z-20" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none z-20" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none z-20" />

      {/* The Image Element itself with Hardware-Accelerated Dynamic Zoom Transformation */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-full object-contain transition-transform duration-150 ease-out will-change-transform"
          style={{
            transform: zoomState.isHovered ? 'scale(2.2)' : 'scale(1)',
            transformOrigin: zoomState.isHovered 
              ? `${zoomState.x}% ${zoomState.y}%` 
              : 'center center',
          }}
        />
      </div>
    </div>
  );
}
