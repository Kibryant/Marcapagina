"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ChevronLeft, Trash2, Calendar, BookOpen, Quote } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [highlightPage, setHighlightPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingHighlight, setSubmittingHighlight] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: bookData } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (bookData) {
      setBook(bookData);

      const { data: sessionsData } = await supabase
        .from("reading_sessions")
        .select("*")
        .eq("book_id", id)
        .order("date", { ascending: false });

      setSessions(sessionsData || []);

      const { data: highlightsData } = await supabase
        .from("highlights")
        .select("*")
        .eq("book_id", id)
        .order("created_at", { ascending: false });

      setHighlights(highlightsData || []);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlight.trim()) return;

    setSubmittingHighlight(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("highlights").insert({
      user_id: user?.id,
      book_id: id,
      content: newHighlight,
      page: highlightPage ? parseInt(highlightPage) : null,
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setNewHighlight("");
      setHighlightPage("");
      toast({ title: "Sucesso", description: "Trecho salvo!", variant: "success" });
      fetchData();
    }
    setSubmittingHighlight(false);
  };

  const handleStartReading = async () => {
    const { error } = await supabase.from("books").update({
      status: "reading",
    }).eq("id", id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bora!", description: "Livro movido para 'Lendo'!", variant: "success" });
      fetchData();
    }
  };

  const handleFinishBook = async () => {
    if (!book) return;

    const remainingPages = book.total_pages - book.current_page;
    const { data: { user } } = await supabase.auth.getUser();

    // 1. If there are remaining pages, log them as a session
    if (remainingPages > 0) {
      await supabase.from("reading_sessions").insert({
        user_id: user?.id,
        book_id: id,
        pages_read: remainingPages,
        date: new Date().toISOString().split("T")[0],
      });
    }

    // 2. Update book status
    const { error } = await supabase.from("books").update({
      current_page: book.total_pages,
      status: "finished",
    }).eq("id", id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Parabéns!", description: "Livro finalizado com sucesso!", variant: "success" });
      fetchData();
    }
  };

  const handleDeleteHighlight = async (highlightId: string) => {
    const { error } = await supabase.from("highlights").delete().eq("id", highlightId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setHighlights(highlights.filter(h => h.id !== highlightId));
      toast({ title: "Removido", description: "Trecho excluído.", variant: "default" });
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </AppShell>
    );
  }

  if (!book) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold">Livro não encontrado.</h1>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/app/books">Voltar para a estante</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const progress = Math.min(100, Math.round((book.current_page / book.total_pages) * 100));

  return (
    <AppShell>
      <div className="space-y-8">
        <Link href="/app/books" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Meus Livros
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Content: Header, Progress & History */}
          <div className="space-y-8">
            {/* Book Header */}
            <section className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
                  <p className="text-muted-foreground text-lg">{book.author}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    book.status === "reading" && "bg-primary/10 text-primary",
                    book.status === "paused" && "bg-warning/10 text-warning",
                    book.status === "finished" && "bg-success/10 text-success",
                    book.status === "wishlist" && "bg-purple-500/10 text-purple-500",
                    book.status === "next" && "bg-sky-500/10 text-sky-500",
                  )}>
                    {book.status === "reading" ? "Lendo"
                      : book.status === "paused" ? "Pausado"
                        : book.status === "finished" ? "Finalizado"
                          : book.status === "wishlist" ? "Lista de Desejos"
                            : "Próximo"}
                  </div>
                  {(book.status === "wishlist" || book.status === "next") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={handleStartReading}
                    >
                      Começar a Ler
                    </Button>
                  )}
                  {book.status !== "finished" && book.status !== "wishlist" && book.status !== "next" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-success/50 text-success hover:bg-success/10 hover:text-success"
                      onClick={handleFinishBook}
                    >
                      Finalizar Livro
                    </Button>
                  )}
                </div>
              </div>

              {(book.status === "reading" || book.status === "paused" || book.status === "finished") && (
                <div className="space-y-3 pt-6 p-6 rounded-2xl border bg-surface shadow-sm">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Progresso da Leitura</span>
                    <span className="text-foreground">{progress}%</span>
                  </div>
                  <ProgressBar className="h-6" value={progress} indicatorClassName={book.status === "finished" ? "bg-success" : "bg-primary"} />
                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span>Página {book.current_page}</span>
                    <span>Total {book.total_pages} páginas</span>
                  </div>
                </div>
              )}
            </section>

            {/* Sessions */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Histórico de Leitura
              </h2>
              {sessions.length > 0 ? (
                <div className="grid gap-3">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{session.pages_read} páginas lidas</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.date + "T12:00:00"), "d 'de' MMMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-2xl text-center border border-dashed">
                  Nenhuma leitura registrada para este livro.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar: Highlights & Notes */}
          <aside className="space-y-8 lg:sticky lg:top-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Quote className="h-5 w-5 text-primary" /> Trechos & Notas
                </h2>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{highlights.length}</span>
              </div>

              <Card className="rounded-2xl border-primary/20 bg-primary/1">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm uppercase tracking-widest text-primary">Novo Trecho</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form onSubmit={handleAddHighlight} className="space-y-4">
                    <textarea
                      className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                      placeholder="Anote algo que você gostou..."
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      required
                    />
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="page" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Página</Label>
                        <Input
                          id="page"
                          type="number"
                          placeholder="Ex: 42"
                          className="rounded-lg"
                          value={highlightPage}
                          onChange={(e) => setHighlightPage(e.target.value)}
                        />
                      </div>
                      <Button
                        className="px-6 rounded-xl shadow-lg shadow-primary/20"
                        type="submit"
                        disabled={submittingHighlight || !newHighlight.trim()}
                      >
                        Salvar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="group relative p-5 rounded-2xl border bg-surface shadow-sm hover:border-primary/40 transition-all duration-200">
                    <p className="text-sm italic text-foreground/90 whitespace-pre-wrap leading-relaxed">&quot;{highlight.content}&quot;</p>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 border-muted/50">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                        {highlight.page ? `Página ${highlight.page}` : "Nota"}
                      </span>
                      <button
                        onClick={() => handleDeleteHighlight(highlight.id)}
                        className="text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
