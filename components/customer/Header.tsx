'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Bell,
  ShoppingCart,
  Home,
  Package,
  Wallet,
  Gift,
  Settings,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NavLinkItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navLinks: NavLinkItem[] = [
  { label: 'الرئيسية', href: '/', icon: Home },
  { label: 'سلة المشتريات', href: '/cart', icon: ShoppingCart },
  { label: 'طلباتي', href: '/orders', icon: Package },
  { label: 'المحفظة وشحن الرصيد', href: '/wallet', icon: Wallet },
  { label: 'الإشعارات', href: '/notifications', icon: Bell },
  { label: 'الإحالات والأرباح', href: '/referrals', icon: Gift },
  { label: 'الإعدادات', href: '/settings', icon: Settings },
];

export function Header() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? null);
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', data.user.id)
          .maybeSingle();
        setWalletBalance(wallet?.balance ?? 0);
      }
      setLoadingUser(false);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between px-4 h-16 max-w-7xl mx-auto">
          {/* الجهة اليمنى: زر القائمة + الشعار */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="فتح القائمة"
              className="text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition-colors"
            >
              <Menu size={26} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck size={24} className="text-[var(--brand-gold)]" />
              <span className="font-bold text-[var(--brand-gold)] text-lg tracking-wide">
                RAIZEY STORE
              </span>
            </Link>
          </div>

          {/* الجهة اليسرى: البحث والسلة والإشعارات */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-label="بحث"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Search size={22} />
            </button>
            <Link
              href="/cart"
              aria-label="السلة"
              className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-[var(--alert-red)] text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/notifications"
              aria-label="الإشعارات"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Bell size={22} />
            </Link>
          </div>
        </div>

        {/* شريط البحث — يظهر عند الضغط على أيقونة البحث */}
        {isSearchOpen && (
          <div className="border-t border-[var(--border)] px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن لعبة أو منتج..."
                  className="w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm pr-10 pl-3 py-2 outline-none focus:border-[var(--brand-gold)] transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="إغلاق البحث"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* الخلفية المعتمة */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        />
      )}

      {/* القائمة الجانبية — تنزلق من اليمين */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-72 max-w-[80%]
          bg-[var(--bg-secondary)] border-l border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <span className="font-semibold text-[var(--text-primary)]">القائمة</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="إغلاق القائمة"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* قسم المستخدم */}
        <div className="p-4 border-b border-[var(--border)]">
          {loadingUser ? (
            <div className="h-12 rounded-lg bg-[var(--border)] animate-pulse" />
          ) : userEmail ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-gold)] flex items-center justify-center">
                  <UserIcon size={20} className="text-[var(--bg-primary)]" />
                </div>
                <span className="text-[var(--text-primary)] text-sm truncate">{userEmail}</span>
              </div>
              <Link
                href="/wallet"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] px-3 py-2 hover:border-[var(--brand-gold)] transition-colors"
              >
                <span className="text-[var(--text-muted)] text-sm">رصيد المحفظة</span>
                <span className="text-[var(--brand-gold)] font-bold text-sm">
                  {walletBalance !== null ? `${walletBalance} ج.س` : '—'}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full text-center rounded-lg bg-[var(--brand-gold)] text-[var(--bg-primary)] font-semibold py-2 text-sm"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full text-center rounded-lg border border-[var(--border)] text-[var(--text-primary)] py-2 text-sm"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          )}
        </div>

        {/* روابط التنقل */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <Icon size={20} className="text-[var(--text-muted)]" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* تسجيل الخروج */}
        {userEmail && (
          <div className="p-2 border-t border-[var(--border)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-[var(--alert-red)] hover:bg-[var(--bg-primary)] transition-colors w-full"
            >
              <LogOut size={20} />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
      }
