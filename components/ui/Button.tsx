import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function Button({
  children,
  isLoading,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm';

  const variants = {
    primary:
      'bg-[var(--brand-gold)] text-[var(--bg-primary)] hover:bg-[var(--brand-orange)] focus:ring-[var(--brand-gold)]',
    secondary:
      'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--brand-gold)] focus:ring-[var(--border)]',
    ghost:
      'text-[var(--text-muted)] hover:text-[var(--brand-gold)] hover:bg-[var(--bg-secondary)]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
