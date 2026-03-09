"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SuggestionCardProps {
  suggestedDaily: number;
  suggestedMonthly: number;
  reason: string;
  isApplying: boolean;
  onApply: () => void;
}

export function SuggestionCard({ suggestedDaily, suggestedMonthly, reason, isApplying, onApply }: SuggestionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Sugestão Inteligente</h3>
          </div>

          <p className="text-sm font-medium leading-relaxed">{reason}</p>

          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-1 bg-background px-3 py-1.5 rounded-lg border">
              <span className="text-muted-foreground">Diária:</span>
              <span className="text-primary">{suggestedDaily}</span>
            </div>
            <div className="flex items-center gap-1 bg-background px-3 py-1.5 rounded-lg border">
              <span className="text-muted-foreground">Mensal:</span>
              <span className="text-primary">{suggestedMonthly}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            onClick={onApply}
            disabled={isApplying}
            className="w-full md:w-auto font-bold rounded-xl"
            size="lg"
          >
            {isApplying ? "Aplicando..." : "Aceitar Sugestão"}
          </Button>
        </div>
      </div>
    </div>
  );
}
