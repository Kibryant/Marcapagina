'use client';

import {
  type LogReadingResult,
  listUnfinishedBooks,
  logReadingSession,
} from '@marcapagina/data';
import { type Book as BookType, cn } from '@marcapagina/shared';
import { Book, ChevronLeft, Minus, Plus, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AppShell } from '@/components/app-shell';
import { ReadingTimer } from '@/components/reading-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogReadingLoadingSkeleton } from '@/components/ui/skeletons';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const MAX_DURATION_MINUTES = 1440;

export default function LogPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchBooks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const data = await listUnfinishedBooks(supabase, user?.id ?? '');

      if (data.length > 0) {
        setBooks(data);
        setSelectedBookId(data[0].id);
      }
    }
    fetchBooks();
  }, [supabase]);

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const remainingPages = selectedBook
    ? Math.max(0, selectedBook.total_pages - selectedBook.current_page)
    : 0;

  const handleSave = async () => {
    if (!selectedBookId) return;

    const validation = z
      .object({
        pagesRead: z
          .number()
          .int()
          .min(1, 'Registre ao menos 1 página.')
          .max(
            remainingPages,
            `Faltam só ${remainingPages} página(s) neste livro.`
          ),
        duration: z
          .number()
          .int()
          .min(0, 'A duração não pode ser negativa.')
          .max(MAX_DURATION_MINUTES, 'A duração máxima é 1440 min (24h).'),
      })
      .safeParse({ pagesRead, duration });

    if (!validation.success) {
      toast({
        title: 'Verifique os dados',
        description: validation.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    let result: LogReadingResult;
    try {
      result = await logReadingSession(supabase, {
        bookId: selectedBookId,
        pagesRead,
        durationMinutes: duration,
      });
    } catch (err) {
      toast({
        title: 'Erro ao registrar leitura',
        description: err instanceof Error ? err.message : 'Erro inesperado',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    let message = `+${result.xpGained} XP acumulados!`;
    if (result.leveledUp) {
      message += ` 🎉 SUBIU PARA O NÍVEL ${result.newLevel}!`;
    }
    if (result.newAchievements.length > 0) {
      message += ` 🏆 Nova conquista: ${result.newAchievements.join(', ')}!`;
    }

    toast({
      title: 'Leitura registrada!',
      description: message,
    });

    router.push('/app');
    router.refresh();
  };

  if (loading) return <LogReadingLoadingSkeleton />;

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          href="/app"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registrar Leitura
            </h1>
            <p className="text-muted-foreground">Quantas páginas você leu?</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimer(!showTimer)}
            className={cn(
              'gap-2',
              showTimer && 'bg-primary/10 text-primary border-primary'
            )}
          >
            <Timer className="h-4 w-4" />{' '}
            {showTimer ? 'Fechar Timer' : 'Usar Timer'}
          </Button>
        </div>

        {showTimer && (
          <ReadingTimer
            onStop={(mins) => {
              setDuration(Math.min(MAX_DURATION_MINUTES, mins));
              setShowTimer(false);
            }}
          />
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Selecione o livro</Label>
              {books.length > 0 ? (
                <div className="grid gap-2">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        setSelectedBookId(book.id);
                        const remaining = Math.max(
                          0,
                          book.total_pages - book.current_page
                        );
                        setPagesRead((current) =>
                          remaining > 0 ? Math.min(current, remaining) : 1
                        );
                      }}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border text-left transition-colors',
                        selectedBookId === book.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground">
                            pág {book.current_page} de {book.total_pages}
                          </p>
                        </div>
                      </div>
                      {selectedBookId === book.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum livro em leitura encontrado.
                </p>
              )}
            </div>

            <div className="space-y-4 border-y py-6 border-dashed">
              <Label className="block text-center text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Páginas lidas
              </Label>
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() => setPagesRead(Math.max(1, pagesRead - 1))}
                  disabled={pagesRead <= 1}
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <div className="text-5xl font-bold w-20 text-center tracking-tighter">
                  {pagesRead}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-border/50"
                  onClick={() =>
                    setPagesRead(Math.min(remainingPages, pagesRead + 1))
                  }
                  disabled={pagesRead >= remainingPages}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              {selectedBook && (
                <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                  {remainingPages > 0
                    ? `${remainingPages} página(s) restantes`
                    : 'Este livro já está no fim'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className="text-xs uppercase text-muted-foreground font-semibold"
                >
                  Duração (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  max={MAX_DURATION_MINUTES}
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      Math.min(
                        MAX_DURATION_MINUTES,
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    )
                  }
                  className="text-center font-mono"
                />
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  * Duração ajuda a calcular seu esforço e XP.
                </p>
              </div>
            </div>

            <Button
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              onClick={handleSave}
              disabled={loading || !selectedBookId || remainingPages === 0}
            >
              {loading ? 'Salvando...' : 'Finalizar Registro'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
