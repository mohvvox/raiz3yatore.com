import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--brand-gold)]/20">
              <ShieldCheck className="w-8 h-8 text-[var(--brand-gold)]" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--brand-gold)] tracking-wider">
            RAIZEY STORE
          </h1>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
