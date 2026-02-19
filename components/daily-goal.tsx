"use client";

import { ProgressBar } from "@/components/ui/progress-bar";

interface DailyGoalProps {
  currentPages: number;
  goal: number;
}

export function DailyGoal({ currentPages, goal }: DailyGoalProps) {
  const progress = Math.min(100, Math.round((currentPages / goal) * 100));
  const remaining = Math.max(0, goal - currentPages);

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-surface p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 shadow-sm">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Foco Diário</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">{currentPages}</span>
              <span className="text-sm font-medium text-muted-foreground">/ {goal} páginas</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-3xl font-black text-primary leading-none">{progress}%</div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
              {progress >= 100 ? "Completo!" : "Em progresso"}
            </p>
          </div>
        </div>

        <div className="relative">
          <ProgressBar value={progress} className="h-3 bg-primary/10" />
          {progress >= 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-white/20 animate-pulse" />
            </div>
          )}
        </div>

        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
          {remaining > 0
            ? `Você está a ${remaining} páginas de atingir seu objetivo hoje.`
            : "Incrível! Você superou sua meta de hoje. Mantenha o ritmo! 🎉"}
        </p>
      </div>
    </div>
  );
}
