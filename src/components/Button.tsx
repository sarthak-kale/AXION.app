import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5 font-bold uppercase tracking-widest text-xs',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-widest text-xs',
    ghost: 'bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest text-xs',
  };

  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  );
};
