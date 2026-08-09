import { Zap, ShieldCheck, Clock } from 'lucide-react';

const promos = [
  {
    icon: Zap,
    title: 'شحن فوري',
    subtitle: 'استلم رصيدك خلال دقائق',
  },
  {
    icon: ShieldCheck,
    title: 'دفع آمن',
    subtitle: 'حماية كاملة لبياناتك ومعاملاتك',
  },
  {
    icon: Clock,
    title: 'دعم على مدار الساعة',
    subtitle: 'فريقنا جاهز لمساعدتك دائماً',
  },
];

export function PromoBanner() {
  return (
    <div className="rounded-xl bg-gradient-to-l from-[var(--brand-gold)] to-[var(--brand-orange)] p-5 mb-6">
      <h2 className="text-[var(--bg-primary)] font-bold text-lg mb-1">
        RAIZEY STORE
      </h2>
      <p className="text-[var(--bg-primary)] text-sm opacity-90 mb-4">
        شحن ألعابك المفضلة بأسرع وقت وأفضل الأسعار
      </p>
      <div className="grid grid-cols-3 gap-2">
        {promos.map((promo) => {
          const Icon = promo.icon;
          return (
            <div key={promo.title} className="flex flex-col items-center text-center gap-1">
              <Icon size={20} className="text-[var(--bg-primary)]" />
              <span className="text-[var(--bg-primary)] text-xs font-semibold">
                {promo.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
