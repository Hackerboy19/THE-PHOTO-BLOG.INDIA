import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * Magnetic button wrapper offering an ultra-subtle, elegant gravity pull
 * designed specifically for elite CTA items like 'INQUIRE NOW' or 'START WHATSAPP CHAT'.
 */
export function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Compute distance from visual center
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Elegant low gravity dampening
    const damp = 0.22;
    setPosition({ x: x * damp, y: y * damp });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 18, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/**
 * Custom Word-by-word cinematic text scrub and layout-reveal.
 * Avoids any structural jump while offering beautiful editorial slide-ups.
 */
export function SplitTextReveal({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, index) => {
        // Look for styling tags inside, or just render normally
        const isItalicized = word.startsWith('_') && word.endsWith('_');
        const cleanWord = isItalicized ? word.slice(1, -1) : word;
        return (
          <span key={index} className="inline-block overflow-hidden mr-[0.25em] last:mr-0 pb-1 align-bottom">
            <motion.span
              className={`inline-block ${isItalicized ? 'italic font-normal text-zinc-300' : ''}`}
              initial={{ y: "115%", opacity: 0, filter: "blur(6px)" }}
              whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.1,
                delay: delay + index * 0.06,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {cleanWord}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Editorial camera defrost/blur viewport animation variant.
 */
export const lensDefocusVariants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 25 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: {
      duration: 1.25,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};
