"use client";

import { ProgressBar } from "@/components/ui/progress-bar";
import { Target, Calendar } from "lucide-react";

interface GoalCardProps {
  title: string;
  type: "daily" | "monthly";
  currentPages: number;
  goal: number;
}

export function GoalCard({ title, type, currentPages, goal }: GoalCardProps) {
  const progress = Math.min(100, Math.round((currentPages / goal) * 100));
  const remaining = Math.max(0, goal - currentPages);

  const Icon = type === "daily" ? Target : Calendar;
  const isComplete = progress >= 100;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-surface p-6 shadow-sm transition-all hover:shadow-md ${isComplete ? 'border-primary/50' : 'border-border'}`}>
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full blur-3xl transition-colors ${isComplete ? 'bg-primary/10' : 'bg-muted/30 group-hover:bg-primary/5'}`} />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black">{currentPages}</span>
              <span className="text-sm font-medium text-muted-foreground">/ {goal}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-black leading-none ${isComplete ? 'text-primary' : 'text-foreground'}`}>
              {progress}%
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
              {isComplete ? "Concluído!" : "Progresso"}
            </p>
          </div>
        </div>

        <div className="relative pt-2">
          <ProgressBar value={progress} className={`h-2 ${isComplete ? 'bg-primary' : 'bg-primary/40'}`} />
        </div>

        <p className="text-xs font-medium text-muted-foreground mt-2">
          {remaining > 0
            ? `Faltam ${remaining} páginas para a meta.`
            : "Meta atingida! Mandou bem."}
        </p>
      </div>
    </div>
  );
}
