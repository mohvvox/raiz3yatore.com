import { ReactNode } from 'react';
import { Header } from '@/components/customer/Header';
import { Footer } from '@/components/customer/Footer';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
