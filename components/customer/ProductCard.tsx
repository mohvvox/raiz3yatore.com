import { Package, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  name: string;
  price: number;
  stock: number | null;
  onSelect?: () => void;
}

export function ProductCard({ name, price, stock, onSelect }: ProductCardProps) {
  const outOfStock = stock !== null && stock <= 0;

  return (
    <button
      onClick={onSelect}
      disabled={outOfStock}
      className={`
        flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors
        bg-[var(--bg-secondary)] border-[var(--border)]
        ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--brand-gold)] cursor-pointer'}
      `}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
        <Package size={22} className="text-[var(--brand-gold)]" />
      </div>
      <span className="text-[var(--text-primary)] text-sm font-medium">{name}</span>
      <span className="text-[var(--brand-gold)] font-bold text-sm">
        {price.toLocaleString('ar-SD')} ج.س
      </span>
      {outOfStock && (
        <span className="flex items-center gap-1 text-[var(--alert-red)] text-xs">
          <AlertCircle size={12} />
          غير متوفر حالياً
        </span>
      )}
    </button>
  );
}
