import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <div
      className={cn(
        'glass rounded-[2rem] p-6 transition-all duration-500',
        hover && 'hover:bg-zinc-900/80 hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5',
        className
      )}
    >
      {children}
    </div>
  );
};
