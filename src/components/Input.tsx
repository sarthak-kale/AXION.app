import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">{label}</label>}
      <input
        className={cn(
          'w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all font-medium',
          error && 'border-red-500/50 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};
