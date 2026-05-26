'use client';

import { consumeStreakFreeze } from '@marcapagina/data';
import { getStreak, type ReadingSession } from '@marcapagina/shared';
import { format, subDays } from 'date-fns';
import { Snowflake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface StreakFreezePanelProps {
  sessions: ReadingSession[];
  freezeDates: string[];
  availableFreezes: number;
}

/**
 * Mostra um banner quando o usuário pode salvar a streak gastando um freeze.
 *
 * Critério: tem freeze disponível, hoje sem leitura, ontem sem leitura,
 * mas anteontem tinha leitura ou já estava coberto. Cobrir ontem reativa a
 * streak antiga sem propaganda enganosa.
 */
export function StreakFreezePanel({
  sessions,
  freezeDates,
  availableFreezes,
}: StreakFreezePanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const yesterday = useMemo(
    () => format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    []
  );
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const canSaveStreak = useMemo(() => {
    if (availableFreezes === 0) return false;

    const totals: Record<string, number> = {};
    sessions.forEach((s) => {
      totals[s.date] = (totals[s.date] || 0) + s.pages_read;
    });
    const freezeSet = new Set(freezeDates);
    const covered = (date: string) =>
      (totals[date] || 0) > 0 || freezeSet.has(date);

    if (covered(yesterday)) return false;
    if (covered(todayStr)) return false;
    // Anteontem precisa estar coberto pra fazer sentido cobrir ontem.
    const dayBefore = format(subDays(new Date(), 2), 'yyyy-MM-dd');
    return covered(dayBefore);
  }, [availableFreezes, sessions, freezeDates, yesterday, todayStr]);

  const streakIfSaved = useMemo(
    () => getStreak(sessions, [...freezeDates, yesterday]),
    [sessions, freezeDates, yesterday]
  );

  const handleUseFreeze = async () => {
    setSubmitting(true);
    try {
      await consumeStreakFreeze(supabase, yesterday);
      toast({
        title: 'Streak salva!',
        description: `Sua sequência de ${streakIfSaved} dias continua. ❄️`,
        variant: 'success',
      });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Não deu pra usar o freeze',
        description: err instanceof Error ? err.message : 'Erro inesperado',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  if (!canSaveStreak) {
    if (availableFreezes === 0) return null;
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-sky-500/20 bg-sky-500/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
          <Snowflake className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">
            {availableFreezes} freeze
            {availableFreezes > 1 ? 's' : ''} disponível
            {availableFreezes > 1 ? 'is' : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pra cobrir um dia perdido sem quebrar a sequência.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-sky-500/30 bg-sky-500/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 shrink-0">
        <Snowflake className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-sky-500">
          Salve sua streak de {streakIfSaved} dias
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Use um freeze pra cobrir ontem e manter a sequência viva.
        </p>
      </div>
      <Button
        onClick={handleUseFreeze}
        disabled={submitting}
        size="sm"
        className="bg-sky-500 hover:bg-sky-500/90 text-white shrink-0"
      >
        {submitting ? 'Usando…' : 'Usar freeze'}
      </Button>
    </div>
  );
}
