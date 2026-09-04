import React from 'react';

interface ChannelLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const ChannelLogo: React.FC<ChannelLogoProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-md -z-10 pointer-events-none transform scale-110" />
      )}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl select-none"
      >
        <defs>
          {/* Outer Gold Gradient */}
          <radialGradient id="goldRim" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#E5B94E" />
            <stop offset="70%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#7A5308" />
          </radialGradient>

          {/* Inner Medallion Gradient */}
          <radialGradient id="goldBevel" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFEAA7" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#996515" />
            <stop offset="100%" stopColor="#5C3A00" />
          </radialGradient>

          {/* Center Blue Disk */}
          <radialGradient id="blueCore" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="45%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Bulb Glow */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="80%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>

          {/* Text Path for Curved 'នាំដឹង - TO KNOW' */}
          <path
            id="topTextPath"
            d="M 40,120 A 80,80 0 0,1 200,120"
            fill="none"
          />
          <path
            id="bottomTextPath"
            d="M 200,120 A 80,80 0 0,1 40,120"
            fill="none"
          />
        </defs>

        {/* 1. Outer Gold Beveled Rim */}
        <circle cx="120" cy="120" r="116" fill="url(#goldRim)" stroke="#FCE788" strokeWidth="2.5" />
        <circle cx="120" cy="120" r="108" fill="none" stroke="#5C3A00" strokeWidth="1.5" opacity="0.6" />
        <circle cx="120" cy="120" r="104" fill="url(#goldBevel)" />
        <circle cx="120" cy="120" r="95" fill="none" stroke="#FFF" strokeWidth="1" opacity="0.4" />

        {/* 2. Inner Deep Navy Blue Disk */}
        <circle cx="120" cy="120" r="92" fill="url(#blueCore)" stroke="#D4AF37" strokeWidth="2" />

        {/* Circular text rim details */}
        <circle cx="120" cy="120" r="90" fill="none" stroke="#FDE047" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />

        {/* Curved Branding Text on Gold Ring */}
        <text className="fill-amber-100 font-bold tracking-widest text-[11px]" style={{ fontFamily: 'Kantumruy Pro, sans-serif' }}>
          <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
            នាំដឹង - TO KNOW
          </textPath>
        </text>
        <text className="fill-amber-200 font-bold tracking-widest text-[10px]" style={{ fontFamily: 'Kantumruy Pro, sans-serif' }}>
          <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
            នាំដឹង - TO KNOW
          </textPath>
        </text>

        {/* Central Core Emblem Graphics */}
        <g transform="translate(120, 102) scale(0.95)">
          {/* Light Rays */}
          <circle cx="0" cy="-22" r="28" fill="#FDE047" opacity="0.12" filter="blur(4px)" />
          
          {/* Growth / Progress Arrow (Rising from book to top right) */}
          <path
            d="M -10,6 L 24,-26 L 16,-26 L 30,-34 L 32,-18 L 26,-20 L -2,12 Z"
            fill="url(#goldRim)"
            stroke="#FEF08A"
            strokeWidth="0.75"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          />

          {/* Open Book Graphics */}
          {/* Left Page */}
          <path
            d="M 0,10 C -12,4 -28,5 -38,-4 C -38,10 -38,14 -38,14 C -28,21 -12,20 0,26 Z"
            fill="#E0E7FF"
            stroke="#FDE047"
            strokeWidth="1.2"
          />
          <path
            d="M 0,6 C -12,0 -28,1 -36,-7"
            stroke="#93C5FD"
            strokeWidth="1"
            fill="none"
          />
          {/* Right Page */}
          <path
            d="M 0,10 C 12,4 28,5 38,-4 C 38,10 38,14 38,14 C 28,21 12,20 0,26 Z"
            fill="#F8FAFC"
            stroke="#FDE047"
            strokeWidth="1.2"
          />
          <path
            d="M 0,6 C 12,0 28,1 36,-7"
            stroke="#93C5FD"
            strokeWidth="1"
            fill="none"
          />

          {/* Center Lightbulb */}
          <g transform="translate(0, -20) scale(0.85)">
            {/* Bulb Shell */}
            <path
              d="M 0,-18 C -11,-18 -16,-10 -16,-1 C -16,6 -10,10 -7,14 L 7,14 C 10,10 16,6 16,-1 C 16,-10 11,-18 0,-18 Z"
              fill="url(#bulbGlow)"
              stroke="#FEF9C3"
              strokeWidth="1.5"
            />
            {/* Filament / Core Light */}
            <path
              d="M -5,-3 L -2,-10 L 2,-10 L 5,-3 M -2,2 L 2,2"
              stroke="#78350F"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bulb Screw Base */}
            <rect x="-6" y="14" width="12" height="3" rx="1.5" fill="#B45309" stroke="#FEF08A" strokeWidth="0.5" />
            <rect x="-5" y="17" width="10" height="2.5" rx="1" fill="#78350F" />
            <path d="M -3,19.5 L 3,19.5" stroke="#92400E" strokeWidth="1" />
          </g>
        </g>

        {/* Central Brand Typography: 'នាំដឹង' & 'To Know' */}
        {/* Khmer text 'នាំដឹង' */}
        <text
          x="120"
          y="156"
          textAnchor="middle"
          className="font-black text-[22px]"
          fill="url(#goldRim)"
          stroke="#5C3A00"
          strokeWidth="0.8"
          style={{ fontFamily: 'Kantumruy Pro, sans-serif', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.8))' }}
        >
          នាំដឹង
        </text>

        {/* English text 'To Know' */}
        <text
          x="120"
          y="173"
          textAnchor="middle"
          className="font-bold tracking-wider text-[11px]"
          fill="#FEF08A"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.12em' }}
        >
          To Know
        </text>
      </svg>
    </div>
  );
};
