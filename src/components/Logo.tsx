import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32, showText = true }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-500/30 blur-lg rounded-full animate-pulse" />
        
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full"
        >
          <path 
            d="M12 3L4 19H8L12 11L16 19H20L12 3Z" 
            fill="url(#logo-gradient)" 
            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
          <path 
            d="M12 7L7 17H9.5L12 12L14.5 17H17L12 7Z" 
            fill="white" 
            fillOpacity="0.8"
          />
          <defs>
            <linearGradient id="logo-gradient" x1="4" y1="3" x2="20" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className="text-xl font-bold tracking-tighter glow-text">
          AXION
        </span>
      )}
    </div>
  );
};
