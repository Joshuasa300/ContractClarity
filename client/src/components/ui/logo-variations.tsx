import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Logo Option 1: Modern Minimalist
export function LogoOption1({ className = "", showText = true, size = 'md' }: LogoProps) {
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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Elegant circular background */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#modernGradient)"
            stroke="url(#borderGlow)"
            strokeWidth="2"
          />
          
          {/* Stylized document icon */}
          <rect
            x="30"
            y="25"
            width="40"
            height="45"
            rx="4"
            fill="white"
            fillOpacity="0.95"
            className="drop-shadow-sm"
          />
          
          {/* Minimalist text lines */}
          <line x1="36" y1="35" x2="58" y2="35" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="43" x2="50" y2="43" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="51" x2="55" y2="51" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Elegant checkmark */}
          <path
            d="M40 58l4 4 8-8"
            stroke="#10B981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="borderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-semibold ${textSizeClasses[size]} bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent tracking-tight`}>
          Contract Clarity
        </span>
      )}
    </div>
  );
}

// Logo Option 2: Elegant Luxury Style
export function LogoOption2({ className = "", showText = true, size = 'md' }: LogoProps) {
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
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xl"
        >
          {/* Sophisticated hexagonal background */}
          <path
            d="M50 5l35 20v40l-35 20L15 65V25l35-20z"
            fill="url(#elegantGradient)"
            stroke="url(#elegantBorder)"
            strokeWidth="2"
          />
          
          {/* Premium document with fold */}
          <path
            d="M28 25h30l8 8v32a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4V25z"
            fill="white"
            fillOpacity="0.95"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          
          {/* Document fold detail */}
          <path
            d="M58 25v8h8"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1"
          />
          
          {/* Refined text lines */}
          <line x1="34" y1="40" x2="54" y2="40" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="47" x2="48" y2="47" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="54" x2="52" y2="54" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
          
          {/* Luxury checkmark with glow */}
          <circle cx="50" cy="62" r="6" fill="#10B981" fillOpacity="0.2" />
          <path
            d="M46 62l2 2 4-4"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="elegantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="elegantBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6B21A8" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-bold ${textSizeClasses[size]} bg-gradient-to-r from-purple-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent`}>
            Contract Clarity
          </span>
          <span className="text-xs text-purple-500 font-light tracking-widest uppercase">
            Legal Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

// Logo Option 3: Corporate Professional
export function LogoOption3({ className = "", showText = true, size = 'md' }: LogoProps) {
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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Professional square with rounded corners */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            rx="18"
            fill="url(#corporateGradient)"
            stroke="url(#corporateBorder)"
            strokeWidth="2"
          />
          
          {/* Layered documents effect */}
          <rect x="20" y="25" width="45" height="35" rx="4" fill="white" fillOpacity="0.9" />
          <rect x="25" y="30" width="45" height="35" rx="4" fill="white" fillOpacity="0.95" />
          <rect x="30" y="35" width="45" height="35" rx="4" fill="white" />
          
          {/* Professional typography lines */}
          <line x1="37" y1="45" x2="62" y2="45" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="37" y1="52" x2="55" y2="52" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="37" y1="59" x2="60" y2="59" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Sophisticated checkmark badge */}
          <circle cx="65" cy="40" r="10" fill="#059669" />
          <path
            d="M60 40l3 3L68 38"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="corporateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="corporateBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} text-gray-800 dark:text-white`}>
            Contract <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Clarity</span>
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            AI-Powered Legal Analysis
          </span>
        </div>
      )}
    </div>
  );
}

// Logo Option 4: Luxury Diamond Style
export function LogoOption4({ className = "", showText = true, size = 'md' }: LogoProps) {
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
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Luxury diamond shape */}
          <path
            d="M50 5l25 18-25 72L25 23l25-18z"
            fill="url(#luxuryGradient)"
            stroke="url(#luxuryBorder)"
            strokeWidth="2"
          />
          
          {/* Inner glow effect */}
          <path
            d="M50 12l18 13-18 55L32 25l18-13z"
            fill="url(#innerGlow)"
            fillOpacity="0.3"
          />
          
          {/* Premium document icon */}
          <rect
            x="35"
            y="30"
            width="30"
            height="35"
            rx="4"
            fill="white"
            fillOpacity="0.95"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          
          {/* Luxury text details */}
          <line x1="40" y1="40" x2="57" y2="40" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="47" x2="52" y2="47" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="54" x2="55" y2="54" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
          
          {/* Premium checkmark with halo */}
          <circle cx="50" cy="61" r="5" fill="#10B981" fillOpacity="0.2" />
          <path
            d="M47 61l2 2 4-4"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <defs>
            <linearGradient id="luxuryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6B21A8" />
              <stop offset="30%" stopColor="#7C3AED" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="luxuryBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581C87" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <radialGradient id="innerGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-light tracking-tight`}>
            <span className="bg-gradient-to-r from-purple-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">Contract</span>
            <span className="text-gray-700 dark:text-gray-300 ml-1">Clarity</span>
          </span>
          <div className="h-px bg-gradient-to-r from-purple-600 to-transparent mt-1 mb-1"></div>
          <span className="text-xs text-purple-600 font-medium tracking-[0.2em] uppercase">
            Premium Legal AI
          </span>
        </div>
      )}
    </div>
  );
}

// Logo Option 5: Tech Startup Style
export function LogoOption5({ className = "", showText = true, size = 'md' }: LogoProps) {
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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Modern gradient background with subtle animation feel */}
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="20"
            fill="url(#techGradient)"
            stroke="url(#techBorder)"
            strokeWidth="2"
          />
          
          {/* AI-inspired geometric pattern */}
          <rect x="25" y="25" width="50" height="40" rx="6" fill="white" fillOpacity="0.95" />
          
          {/* Modern data visualization lines */}
          <line x1="32" y1="35" x2="55" y2="35" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="42" x2="48" y2="42" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="49" x2="52" y2="49" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="56" x2="45" y2="56" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" />
          
          {/* Tech-style checkmark with circuit pattern */}
          <circle cx="62" cy="45" r="8" fill="url(#techCheckGradient)" stroke="#059669" strokeWidth="1" />
          <path
            d="M58 45l2.5 2.5L66 42"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Subtle tech pattern */}
          <circle cx="20" cy="20" r="2" fill="#8B5CF6" fillOpacity="0.3" />
          <circle cx="80" cy="20" r="2" fill="#A855F7" fillOpacity="0.3" />
          <circle cx="20" cy="80" r="2" fill="#C084FC" fillOpacity="0.3" />
          <circle cx="80" cy="80" r="2" fill="#6366F1" fillOpacity="0.3" />
          
          <defs>
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="techBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="techCheckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 via-purple-600 to-purple-800 bg-clip-text text-transparent`}>
          Contract Clarity
        </span>
      )}
    </div>
  );
}