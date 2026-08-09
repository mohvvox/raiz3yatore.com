import { createClient } from '@/lib/supabase/server';
import { PromoBanner } from '@/components/customer/PromoBanner';
import { GameCard } from '@/components/customer/GameCard';
import { Gamepad2 } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: games } = await supabase
    .from('games')
    .select('id, name, slug, icon_key')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PromoBanner />

      <section>
        <h2 className="text-[var(--text-primary)] font-bold text-lg mb-4">
          الألعاب المتاحة
        </h2>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                name={game.name}
                slug={game.slug}
                iconKey={game.icon_key}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Gamepad2 size={40} className="text-[var(--text-muted)]" />
            <p className="text-[var(--text-muted)] text-sm">
              لا توجد ألعاب متاحة حالياً، ترقبوا الإضافات قريباً.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
