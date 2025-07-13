import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Back document (slightly offset) */}
          <rect
            x="15"
            y="10"
            width="60"
            height="75"
            rx="4"
            fill="url(#contractGradientC1)"
            stroke="url(#contractBorderC)"
            strokeWidth="1"
          />
          
          {/* Front document (main) */}
          <rect
            x="25"
            y="15"
            width="60"
            height="75"
            rx="4"
            fill="url(#contractGradientC2)"
            stroke="url(#contractBorderC)"
            strokeWidth="2"
          />
          
          {/* Document text lines */}
          <line x1="32" y1="28" x2="70" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="35" x2="65" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="42" x2="68" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="49" x2="62" y2="49" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="56" x2="66" y2="56" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="63" x2="60" y2="63" stroke="white" strokeWidth="2" strokeLinecap="round" />
          
          {/* Signature line */}
          <line x1="32" y1="75" x2="65" y2="75" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Purple Checkmark with white background */}
          <circle 
            cx="75" 
            cy="75" 
            r="12" 
            fill="white" 
            stroke="url(#contractBorderC)" 
            strokeWidth="2"
          />
          <path
            d="M70 75l3 3 6-6"
            stroke="url(#purpleCheckGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="contractGradientC1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="contractGradientC2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="contractBorderC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#6B21A8" />
            </linearGradient>
            <linearGradient id="purpleCheckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} text-gray-800 dark:text-white`}>
          Contract <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Clarity</span>
        </span>
      )}
    </div>
  );
}