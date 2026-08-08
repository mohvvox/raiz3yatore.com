import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error';
  message: string;
}

export default function Alert({ type = 'error', message }: AlertProps) {
  if (!message) return null;

  const styles = {
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    error: 'bg-[var(--alert-red)]/10 text-[var(--alert-red)] border-[var(--alert-red)]/30',
  };

  const Icon = type === 'success' ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`flex items-center gap-2 p-3 text-sm border rounded-lg ${styles[type]}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
