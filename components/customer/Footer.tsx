import Link from 'next/link';
import { ShieldCheck, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-[var(--brand-gold)]" />
          <span className="font-bold text-[var(--brand-gold)]">RAIZEY STORE</span>
        </div>
        <p className="text-[var(--text-muted)] text-sm mb-4">
          منصة موثوقة لشحن ألعابك المفضلة بأسرع وقت وأفضل الأسعار.
        </p>
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            من نحن
          </Link>
          <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            الشروط والأحكام
          </Link>
          <Link href="/support" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            الدعم الفني
          </Link>
        </div>
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--brand-gold)]"
        >
          <MessageCircle size={18} />
          تواصل معنا عبر واتساب
        </a>
        <p className="text-[var(--text-muted)] text-xs mt-6">
          © {new Date().getFullYear()} Raizey Store. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
