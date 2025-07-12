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
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Document Shape */}
          <path
            d="M20 15C20 12.7909 21.7909 11 24 11H65L80 26V85C80 87.2091 78.2091 89 76 89H24C21.7909 89 20 87.2091 20 85V15Z"
            fill="url(#documentGradient)"
            stroke="url(#strokeGradient)"
            strokeWidth="2"
          />
          
          {/* Document Corner Fold */}
          <path
            d="M65 11V21C65 23.2091 66.7909 25 69 25H80L65 11Z"
            fill="url(#foldGradient)"
            stroke="url(#strokeGradient)"
            strokeWidth="1"
          />
          
          {/* Document Lines */}
          <rect x="30" y="35" width="25" height="3" rx="1.5" fill="url(#lineGradient)" />
          <rect x="30" y="45" width="35" height="3" rx="1.5" fill="url(#lineGradient)" />
          <rect x="30" y="55" width="30" height="3" rx="1.5" fill="url(#lineGradient)" />
          
          {/* Check Circle */}
          <circle
            cx="65"
            cy="65"
            r="18"
            fill="url(#checkBgGradient)"
            stroke="url(#strokeGradient)"
            strokeWidth="2"
          />
          
          {/* Check Mark */}
          <path
            d="M57 65L62 70L73 59"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="documentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            
            <linearGradient id="foldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            
            <linearGradient id="checkBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          Contract Clarity
        </span>
      )}
    </div>
  );
}