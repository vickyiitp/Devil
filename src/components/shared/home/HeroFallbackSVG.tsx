import React from 'react';

const HeroFallbackSVG: React.FC<{ className?: string }> = ({ className = "w-full h-[420px]" }) => {
  return (
    <div className={`${className} relative overflow-hidden bg-[#060712]`} aria-hidden="true">
      <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#001a33" />
            <stop offset="100%" stopColor="#1a001f" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1200" height="420" fill="url(#g1)"></rect>

        {/* subtle moving glow */}
        <circle cx="200" cy="120" r="200" fill="url(#glow)" className="glow-anim" />
        <circle cx="1000" cy="300" r="140" fill="url(#glow)" style={{ opacity: 0.6 }} className="glow-anim delay-2000" />

        {/* stylized knot shape */}
        <g transform="translate(560,200)">
          <path d="M-120,-20 C-40,-140 40,-140 120,-20 C40,100 -40,100 -120,-20 Z" fill="rgba(255,255,255,0.03)" />
          <path d="M-90,-10 C-10,-100 10,-100 90,-10 C10,80 -10,80 -90,-10 Z" fill="rgba(0,209,255,0.06)" />
        </g>
      </svg>
    </div>
  );
}

export default HeroFallbackSVG;