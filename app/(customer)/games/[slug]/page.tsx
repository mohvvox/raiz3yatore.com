import { createClient } from '@/lib/supabase/server';
import { GameBrowser } from '@/components/customer/GameBrowser';
import { notFound } from 'next/navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from('games')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!game) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('game_id', game.id)
    .order('sort_order', { ascending: true });

  const categoryIds = (categories || []).map((c) => c.id);

  const { data: products } = categoryIds.length
    ? await supabase
        .from('products')
        .select('id, name, price, stock, category_id')
        .in('category_id', categoryIds)
        .eq('is_active', true)
    : { data: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-[var(--text-primary)] font-bold text-xl mb-5">
        {game.name}
      </h1>

      <GameBrowser
        categories={categories || []}
        products={(products || []).map((p) => ({ ...p, price: Number(p.price) }))}
      />
    </div>
  );
}
