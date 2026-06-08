import React from 'react';
import { motion } from 'motion/react';

interface EditorialDividerProps {
  label?: string;
}

export default function EditorialDivider({ label }: EditorialDividerProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-10 flex items-center justify-center" aria-hidden="true">
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent relative flex items-center justify-center">
        {label ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 0.7, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="absolute bg-[#080808] px-6 text-[8px] font-mono tracking-[0.4em] text-zinc-500 uppercase flex items-center gap-2 select-none"
          >
            <span>✦</span>
            <span>{label}</span>
            <span>✦</span>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.5, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="absolute bg-[#080808] px-4 text-[8px] text-zinc-500 select-none"
          >
            ✦
          </motion.div>
        )}
      </div>
    </div>
  );
}
