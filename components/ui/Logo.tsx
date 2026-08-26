import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Liquid Glass Geometric Icon */}
      <div
        className={`${iconSizes[size]} rounded-2xl liquid-glass-elevated border border-white/20 flex items-center justify-center text-white shadow-xl relative overflow-hidden transition-all duration-200 group-hover:scale-105 active:scale-95 group-hover:border-accent/60`}
      >
        {/* Specular Top Reflection Sheen */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
        {/* Soft Ambient Inner Glow */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent/40 rounded-full blur-md pointer-events-none" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 relative z-10 text-white drop-shadow-[0_2px_8px_rgba(37,99,235,0.8)]"
        >
          <path d="M12 4v12" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      </div>

      {/* Liquid Glass Wordmark */}
      {showText && (
        <div className="flex items-center tracking-tight font-black">
          {/* "Pak" in High-Sheen Glass White */}
          <span className={`text-text-primary tracking-tight font-extrabold ${textSizes[size]} drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]`}>
            Pak
          </span>

          {/* "Get" in Liquid Glass Badge / Gradient Sheen */}
          <span
            className={`ml-1 px-2 py-0.5 rounded-xl liquid-glass-pill border border-accent/40 text-accent font-black ${textSizes[size]} shadow-sm drop-shadow-[0_0_12px_rgba(37,99,235,0.4)] group-hover:border-accent group-hover:text-white group-hover:bg-accent/30 transition-all`}
          >
            Get
          </span>
        </div>
      )}
    </Link>
  );
}
