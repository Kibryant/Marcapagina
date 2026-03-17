import type { Achievement } from '@marcapagina/shared';
import { cn } from '@marcapagina/shared';
import {
  Award,
  BookOpen,
  Flame,
  Library,
  Lock,
  type LucideIcon,
  Moon,
  Trophy,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Flame,
  Zap,
  Moon,
  Trophy,
  Library,
};

interface AchievementCardProps {
  achievement: Achievement;
  unlocked?: boolean;
  unlockedAt?: string;
}

export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
}: AchievementCardProps) {
  const Icon = ICON_MAP[achievement.icon] || Award;

  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-2xl border p-4 transition-all duration-300',
        unlocked
          ? 'bg-surface border-primary/20 shadow-sm'
          : 'bg-muted/30 border-border/50 grayscale opacity-60'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-transform duration-500 group-hover:scale-110',
            unlocked
              ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-bold leading-none">{achievement.name}</h3>
          <p className="text-xs text-muted-foreground leading-tight">
            {achievement.description}
          </p>
          {unlocked && unlockedAt && (
            <p className="text-[10px] text-primary/60 font-medium">
              Conquistado em {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {unlocked && (
        <div className="absolute top-0 right-0 p-2">
          <div className="bg-primary text-[8px] font-black text-primary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
            Badge
          </div>
        </div>
      )}

      {!unlocked && (
        <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
