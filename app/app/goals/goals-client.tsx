"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { GoalCard } from "@/components/v4/goal-card";
import { SuggestionCard } from "@/components/v4/suggestion-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Goal, calculateGoalsSuggestions } from "@/lib/utils";

export function GoalsClient({
  currentPages,
  currentMonthPages,
  goal,
  suggestion
}: {
  currentPages: number,
  currentMonthPages: number,
  goal: Goal | null,
  suggestion: ReturnType<typeof calculateGoalsSuggestions> | null
}) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [dailyGoalStr, setDailyGoalStr] = useState(String(goal?.daily_pages || ""));
  const [monthlyGoalStr, setMonthlyGoalStr] = useState(String(goal?.monthly_pages || ""));

  const handleApplySuggestion = async () => {
    setIsApplying(true);

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado." });
      setIsApplying(false);
      return;
    }

    if (!suggestion) {
      toast({ title: "Erro", description: "Sugestão não encontrada." });
      setIsApplying(false);
      return;
    }

    try {
      // Deactivate current goals
      await supabase.from("goals").update({ active: false }).eq("user_id", user.id);

      // Insert new goal
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        daily_pages: suggestion.suggestedDaily,
        monthly_pages: suggestion.suggestedMonthly,
        suggested_daily_pages: suggestion.suggestedDaily,
        suggested_monthly_pages: suggestion.suggestedMonthly,
        suggested_reason: suggestion.reason,
        active: true
      });

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Suas metas foram atualizadas." });
      router.refresh(); // Reload to fetch fresh data
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    const d = parseInt(dailyGoalStr);
    const m = parseInt(monthlyGoalStr);

    if (isNaN(d) || isNaN(m) || d <= 0 || m <= 0) {
      toast({ title: "Erro", description: "Valores inválidos. Use números maiores que zero.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    try {
      await supabase.from("goals").update({ active: false }).eq("user_id", user.id);

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        daily_pages: d,
        monthly_pages: m,
        active: true
      });

      if (error) throw error;

      toast({ title: "Metas salvas", description: "Suas metas manuais foram registradas com sucesso." });
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Progress Cards */}
      {goal?.daily_pages && goal?.monthly_pages && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Progresso Atual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GoalCard
              title="Meta Diária"
              type="daily"
              currentPages={currentPages}
              goal={goal.daily_pages}
            />
            <GoalCard
              title="Meta Mensal"
              type="monthly"
              currentPages={currentMonthPages}
              goal={goal.monthly_pages}
            />
          </div>
        </section>
      )}

      {/* Suggestion Card */}
      {suggestion && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sua recomendação</h2>
          <SuggestionCard
            suggestedDaily={suggestion.suggestedDaily}
            suggestedMonthly={suggestion.suggestedMonthly}
            reason={suggestion.reason}
            isApplying={isApplying}
            onApply={handleApplySuggestion}
          />
        </section>
      )}

      {/* Manual Edit Form */}
      <section className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Editar Manualmente</h2>
        <Card className="p-6">
          <form onSubmit={handleManualSave} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="daily">Meta Diária (Páginas)</Label>
              <Input
                id="daily"
                type="number"
                value={dailyGoalStr}
                onChange={(e) => setDailyGoalStr(e.target.value)}
                min="1"
                placeholder="Ex: 20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Meta Mensal (Páginas)</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyGoalStr}
                onChange={(e) => setMonthlyGoalStr(e.target.value)}
                min="1"
                placeholder="Ex: 500"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Salvando..." : "Salvar Metas"}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
