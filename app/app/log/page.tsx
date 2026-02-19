"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ChevronLeft, Book, Timer } from "lucide-react";
import { ReadingTimer } from "@/components/reading-timer";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [pagesRead, setPagesRead] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchBooks() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user?.id)
        .neq("status", "finished")
        .order("title");

      if (data && data.length > 0) {
        setBooks(data);
        setSelectedBookId(data[0].id);
      }
    }
    fetchBooks();
  }, [supabase]);

  const handleSave = async () => {
    if (!selectedBookId) return;
    setLoading(true);

    const book = books.find(b => b.id === selectedBookId);
    const newCurrentPage = Math.min(book.total_pages, book.current_page + pagesRead);
    const isFinished = newCurrentPage === book.total_pages;

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create session
    const { error: sessionError } = await supabase.from("reading_sessions").insert({
      user_id: user?.id,
      book_id: selectedBookId,
      pages_read: pagesRead,
      duration_minutes: duration,
      date: new Date().toISOString().split('T')[0],
    });

    if (sessionError) {
      alert("Erro ao salvar sessão: " + sessionError.message);
      setLoading(false);
      return;
    }

    // 2. Update book
    const { error: bookError } = await supabase
      .from("books")
      .update({
        current_page: newCurrentPage,
        status: isFinished ? "finished" : book.status,
      })
      .eq("id", selectedBookId);

    if (bookError) {
      alert("Erro ao atualizar livro: " + bookError.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/app" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Leitura</h1>
            <p className="text-muted-foreground">Quantas páginas você leu?</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimer(!showTimer)}
            className={cn("gap-2", showTimer && "bg-primary/10 text-primary border-primary")}
          >
            <Timer className="h-4 w-4" /> {showTimer ? "Fechar Timer" : "Usar Timer"}
          </Button>
        </div>

        {showTimer && (
          <ReadingTimer
            onStop={(mins) => {
              setDuration(mins);
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
                      onClick={() => setSelectedBookId(book.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border text-left transition-colors",
                        selectedBookId === book.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground">pág {book.current_page} de {book.total_pages}</p>
                        </div>
                      </div>
                      {selectedBookId === book.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum livro em leitura encontrado.</p>
              )}
            </div>

            <div className="space-y-4 border-y py-6 border-dashed">
              <Label className="block text-center text-sm text-muted-foreground uppercase tracking-wider font-semibold">Páginas lidas</Label>
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
                  onClick={() => setPagesRead(pagesRead + 1)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs uppercase text-muted-foreground font-semibold">Duração (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
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
              disabled={loading || !selectedBookId}
            >
              {loading ? "Salvando..." : "Finalizar Registro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

