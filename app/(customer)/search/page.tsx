'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/customer/ProductCard';

interface ProductResult {
  id: string;
  name: string;
  price: number;
  stock: number | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('is_active', true)
        .ilike('name', `%${query.trim()}%`)
        .limit(30);

      setResults((data || []).map((p) => ({ ...p, price: Number(p.price) })));
      setLoading(false);
    }, 400); // بحث فوري مع تأخير بسيط لتقليل الطلبات أثناء الكتابة

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative mb-6">
        <SearchIcon
          size={18}
          className="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--text-muted)]"
        />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن باقة أو منتج..."
          className="w-full rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm pr-10 pl-3 py-3 outline-none focus:border-[var(--brand-gold)] transition-colors"
        />
      </div>

      {loading && (
        <p className="text-[var(--text-muted)] text-sm text-center py-8">جاري البحث...</p>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package size={40} className="text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)] text-sm">
            لا توجد نتائج مطابقة لـ &quot;{query}&quot;
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-[var(--text-muted)] text-sm text-center py-8">
            جاري التحميل...
          </p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
