import React from 'react';

interface BrandLogoProps {
  className?: string;
  theme?: 'dark' | 'light' | 'yellow' | 'minimal';
}

export default function BrandLogo({ className = '', theme = 'light' }: BrandLogoProps) {
  // Determine color variables based on requested color palette
  // Golden yellow: #FFDA03, Light cream: #FFEEB7, Pure Black: #000000, Pure White: #FFFFFF
  let mainColor = '#FFFFFF';
  let secondaryColor = '#FFEEB7';
  let yellowColor = '#FFDA03';

  if (theme === 'dark') {
    mainColor = '#000000';
    secondaryColor = '#FFEEB7';
  } else if (theme === 'yellow') {
    mainColor = '#FFDA03';
    secondaryColor = '#FFFFFF';
  } else if (theme === 'minimal') {
    mainColor = '#FFFFFF';
    secondaryColor = '#A1A1AA';
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`} id="brand-logo-container">
      {/* Top Brand Name Text */}
      <span 
        className="text-[12px] sm:text-[14px] font-sans font-extrabold tracking-[0.18em] uppercase select-none transition-colors duration-300"
        style={{ color: theme === 'yellow' ? '#111111' : theme === 'dark' ? '#000000' : '#FFFFFF' }}
      >
        THE PHOTO BLOG.INDIA
      </span>

      {/* Camera Vector Art with Yin-Yang Aperture */}
      <svg 
        className="w-24 h-16 my-1.5 opacity-90 hover:opacity-100 transition-opacity duration-300"
        viewBox="0 0 160 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle camera horizon guide line */}
        <line 
          x1="5" y1="52" x2="40" y2="46" 
          stroke={theme === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'} 
          strokeWidth="1" 
        />
        <line 
          x1="120" y1="48" x2="155" y2="52" 
          stroke={theme === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'} 
          strokeWidth="1" 
        />

        {/* Top small dial button */}
        <rect 
          x="105" y="16" width="16" height="5" rx="1.5" 
          stroke={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          strokeWidth="1.2" 
        />
        {/* Top viewfinder bump */}
        <path 
          d="M68 21 L71 16 C71.5 15 72.5 15 73 15 L87 15 C87.5 15 88.5 15 89 16 L92 21 Z" 
          stroke={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          strokeWidth="1.2" 
          fill={theme === 'dark' ? '#FFFFFF' : '#000000'}
        />

        {/* Main Camera Body */}
        <rect 
          x="42" y="21" width="76" height="48" rx="6" 
          stroke={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          strokeWidth="1.2" 
          fill="none"
        />

        {/* Lens Outer circle */}
        <circle 
          cx="80" cy="45" r="21" 
          stroke={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          strokeWidth="1.2" 
          fill={theme === 'dark' ? '#000000' : '#000000'}
        />
        {/* Lens inner circle */}
        <circle 
          cx="80" cy="45" r="18" 
          stroke={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          strokeWidth="0.8" 
        />

        {/* Yin-Yang Aperture Blades Detail (Exactly like logo) */}
        <g transform="translate(80, 45)">
          {/* S-curve separating yin and yang halves */}
          <path 
            d="M 0,-18 A 9,9 0 0,0 0,0 A 9,9 0 0,1 0,18 A 18,18 0 0,0 0,-18 Z" 
            fill={theme === 'dark' ? '#000000' : '#FFFFFF'} 
          />
          {/* Black half background */}
          <path 
            d="M 0,-18 A 18,18 0 0,1 0,18 A 9,9 0 0,1 0,0 A 9,9 0 0,0 0,-18 Z" 
            fill={theme === 'dark' ? '#FFFFFF' : '#111111'} 
          />

          {/* Yin-Yang core dots */}
          <circle cx="0" cy="-9" r="2.5" fill={theme === 'dark' ? '#FFFFFF' : '#111111'} />
          <circle cx="0" cy="9" r="2.5" fill={theme === 'dark' ? '#000000' : '#FFFFFF'} />

          {/* Golden Yellow aperture lines surrounding lens for color palette theme tie-in */}
          {[-45, 0, 45, 90, 135, 180, 225, 270].map((rotation, index) => (
            <line
              key={index}
              x1="0" y1="18" x2="4" y2="21"
              stroke="#FFDA03"
              strokeWidth="0.8"
              transform={`rotate(${rotation})`}
              className="opacity-70"
            />
          ))}
        </g>
      </svg>

      {/* Bottom Founder Name Text with broad elegant letter-spacing */}
      <span 
        className="text-[10px] sm:text-[11px] uppercase tracking-[0.6em] md:tracking-[0.62em] font-sans font-semibold pl-[0.6em] transition-colors duration-300"
        style={{ color: theme === 'yellow' ? '#111111' : '#FFEEB7' }}
      >
        M U S K A N
      </span>
    </div>
  );
}
