import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border p-4
        bg-[var(--bg-secondary)]
        border-[var(--border)]
        ${hoverable ? 'transition-colors hover:border-[var(--brand-gold)] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-[var(--text-primary)] font-semibold text-base">{title}</h3>
        {subtitle && (
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
      {children}
    </div>
  );
}
