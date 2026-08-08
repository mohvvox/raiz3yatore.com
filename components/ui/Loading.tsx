import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  label?: string;
  fullScreen?: boolean;
}

export function Spinner({ size = 24, label, fullScreen = false }: SpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        size={size}
        className="animate-spin text-[var(--brand-gold)]"
      />
      {label && (
        <span className="text-[var(--text-muted)] text-sm">{label}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-primary)] z-50">
        {content}
      </div>
    );
  }

  return content;
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--border)] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <Skeleton className="h-32 w-full mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
