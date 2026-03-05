import React from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
  const variants = {
    primary: 'bg-[#D45D79] text-white hover:bg-[#c04b65] shadow-md',
    secondary: 'bg-[#FDF2F4] text-[#D45D79] hover:bg-[#fce4e9]',
    outline: 'border-2 border-[#D45D79] text-[#D45D79] hover:bg-[#FDF2F4]',
    ghost: 'text-[#D45D79] hover:bg-[#FDF2F4]/50'
  };

  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-[#FDF2F4] p-6', className)}>
      {children}
    </div>
  );
}
