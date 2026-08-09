import Link from 'next/link';
import { Gamepad2, Flame, Sword, Target, Joystick, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'gamepad-2': Gamepad2,
  flame: Flame,
  sword: Sword,
  target: Target,
  joystick: Joystick,
};

interface GameCardProps {
  name: string;
  slug: string;
  iconKey: string | null;
}

export function GameCard({ name, slug, iconKey }: GameCardProps) {
  const Icon = (iconKey && iconMap[iconKey]) || Gamepad2;

  return (
    <Link
      href={`/games/${slug}`}
      className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--brand-gold)] transition-colors"
    >
      <div className="w-14 h-14 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
        <Icon size={28} className="text-[var(--brand-gold)]" />
      </div>
      <span className="text-[var(--text-primary)] text-sm font-medium text-center">
        {name}
      </span>
    </Link>
  );
}
