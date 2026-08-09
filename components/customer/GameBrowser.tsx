'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, Package } from 'lucide-react';
import { ProductCard } from '@/components/customer/ProductCard';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  category_id: string;
}

interface GameBrowserProps {
  categories: Category[];
  products: Product[];
}

export function GameBrowser({ categories, products }: GameBrowserProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategoryId === 'all' || p.category_id === activeCategoryId;
      const min = minPrice ? parseFloat(minPrice) : null;
      const max = maxPrice ? parseFloat(maxPrice) : null;
      const matchesMin = min === null || p.price >= min;
      const matchesMax = max === null || p.price <= max;
      return matchesCategory && matchesMin && matchesMax;
    });
  }, [products, activeCategoryId, minPrice, maxPrice]);

  return (
    <div>
      {/* تبويبات الفئات */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategoryId('all')}
          className={`
            shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${activeCategoryId === 'all'
              ? 'bg-[var(--brand-gold)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]'}
          `}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`
              shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeCategoryId === cat.id
                ? 'bg-[var(--brand-gold)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]'}
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* زر إظهار فلتر السعر */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-3"
      >
        <SlidersHorizontal size={16} />
        فلترة حسب السعر
      </button>

      {showFilters && (
        <div className="flex items-center gap-3 mb-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
          <div className="flex-1">
            <label className="text-[var(--text-muted)] text-xs mb-1 block">من (ج.س)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[var(--text-muted)] text-xs mb-1 block">إلى (ج.س)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="—"
              className="w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm px-3 py-2 outline-none focus:border-[var(--brand-gold)]"
            />
          </div>
        </div>
      )}

      {/* شبكة المنتجات */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package size={40} className="text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)] text-sm">
            لا توجد باقات مطابقة لهذا الفلتر حالياً.
          </p>
        </div>
      )}
    </div>
  );
}
