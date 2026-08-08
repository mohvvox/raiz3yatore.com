import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)] transition-all ${icon ? 'pr-10' : ''} ${error ? 'border-[var(--alert-red)]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-[var(--alert-red)]">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
