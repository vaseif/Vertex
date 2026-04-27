import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-0 group cursor-pointer ${className}`}>
      {/* VER part */}
      <div className="flex flex-col items-end">
        <span className="text-2xl font-black tracking-tighter text-white leading-none">VER</span>
        <div className="flex gap-[3px] mt-1 pr-0.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-brand rounded-sm shadow-[0_0_8px_rgba(31,207,177,0.5)]" />
          ))}
        </div>
      </div>

      {/* Stylized geometric X */}
      <div className="relative w-12 h-12 mx-1.5 transition-transform group-hover:scale-110 duration-500">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(31,207,177,0.2)] md:drop-shadow-[0_0_20px_rgba(31,207,177,0.4)]">
          {/* Top-left to bottom-right arm */}
          <path 
            d="M20,20 L50,50 L80,80 L70,90 L40,60 L10,30 Z" 
            fill="#1a1a2e" 
            stroke="#1fcfb1" 
            strokeWidth="0.5"
          />
          <path 
            d="M20,20 L35,15 L50,50 L35,55 Z" 
            fill="#1fcfb1"
          />
          
          {/* Top-right to bottom-left arm */}
          <path 
            d="M80,20 L50,50 L20,80 L30,90 L60,60 L90,30 Z" 
            fill="#0f0f1a"
            stroke="#1fcfb1" 
            strokeWidth="0.5"
          />
          <path 
            d="M80,20 L65,15 L50,50 L65,55 Z" 
            fill="#1fcfb1" 
            opacity="0.8"
          />
          
          {/* Bottom highlight segments */}
          <path 
            d="M50,50 L70,90 L85,85 L60,45 Z" 
            fill="#1fcfb1"
          />
          <path 
            d="M50,50 L30,90 L15,85 L40,45 Z" 
            fill="#1a1a2e"
          />
        </svg>
      </div>

      {/* TEX part */}
      <div className="flex flex-col items-start">
        <span className="text-2xl font-black tracking-tighter text-white leading-none">TEX</span>
      </div>
    </div>
  );
};