'use client';

import {
  type Book as BookType,
  cn,
  getStreak,
  type Highlight,
  type ReadingSession,
} from '@marcapagina/shared';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Pencil,
  Quote,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { SharingCard } from '@/components/sharing-card';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookDetailsLoadingSkeleton } from '@/components/ui/skeletons';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

export default function BookDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<BookType | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [allSessions, setAllSessions] = useState<ReadingSession[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [highlightPage, setHighlightPage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingHighlight, setSubmittingHighlight] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [summary, setSummary] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);

  // Delete book
  const [deletingBook, setDeletingBook] = useState(false);

  // Edit/delete sessions
  const [editingSession, setEditingSession] = useState<{
    id: string;
    pages: number;
    date: string;
  } | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  const supabase = createClient();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: bookData } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (bookData) {
      setBook(bookData);

      const { data: sessionsData } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('book_id', id)
        .order('date', { ascending: false });

      setSessions(sessionsData || []);

      const { data: allSessionsData } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      setAllSessions(allSessionsData || []);

      const { data: highlightsData } = await supabase
        .from('highlights')
        .select('*')
        .eq('book_id', id)
        .order('created_at', { ascending: false });

      setHighlights(highlightsData || []);

      setSummary(bookData.summary || '');
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHighlight.trim()) return;

    setSubmittingHighlight(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('highlights').insert({
      user_id: user?.id,
      book_id: id,
      content: newHighlight,
      page: highlightPage ? parseInt(highlightPage, 10) : null,
    });

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setNewHighlight('');
      setHighlightPage('');
      toast({
        title: 'Sucesso',
        description: 'Trecho salvo!',
        variant: 'success',
      });
      fetchData();
    }
    setSubmittingHighlight(false);
  };

  const handleRating = async (rating: number) => {
    if (!book || savingRating) return;
    setSavingRating(true);
    const newRating = book.rating === rating ? null : rating;
    const { error } = await supabase
      .from('books')
      .update({ rating: newRating })
      .eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setBook({ ...book, rating: newRating });
      toast({
        title: newRating
          ? `${newRating} estrela${newRating > 1 ? 's' : ''}! ⭐`
          : 'Avaliação removida',
        variant: 'success',
      });
    }
    setSavingRating(false);
  };

  const handleSaveSummary = async () => {
    if (!book || savingSummary) return;
    setSavingSummary(true);
    const { error } = await supabase
      .from('books')
      .update({ summary })
      .eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setBook({ ...book, summary });
      setIsEditingSummary(false);
      toast({
        title: 'Sucesso',
        description: 'Reflexão salva!',
        variant: 'success',
      });
    }
    setSavingSummary(false);
  };

  const handleStartReading = async () => {
    const { error } = await supabase
      .from('books')
      .update({ status: 'reading' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Bora!',
        description: "Livro movido para 'Lendo'!",
        variant: 'success',
      });
      fetchData();
    }
  };

  const handleFinishBook = async () => {
    if (!book) return;

    const remainingPages = book.total_pages - book.current_page;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (remainingPages > 0) {
      await supabase.from('reading_sessions').insert({
        user_id: user?.id,
        book_id: id,
        pages_read: remainingPages,
        date: new Date().toISOString().split('T')[0],
      });
    }

    const { error } = await supabase
      .from('books')
      .update({ current_page: book.total_pages, status: 'finished' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Parabéns!',
        description: 'Livro finalizado com sucesso!',
        variant: 'success',
      });
      fetchData();
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    if (!book) return;
    const value = newCategory === 'none' ? null : newCategory;
    const { error } = await supabase
      .from('books')
      .update({ category: value })
      .eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setBook({ ...book, category: value });
      toast({ title: 'Categoria atualizada!', variant: 'success' });
    }
  };

  const handleDeleteHighlight = async (highlightId: string) => {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', highlightId);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setHighlights(highlights.filter((h) => h.id !== highlightId));
      toast({ title: 'Removido', description: 'Trecho excluído.' });
    }
  };

  // ── Delete book ──────────────────────────────────────────────────────────────
  const handleDeleteBook = async () => {
    if (!book) return;
    setDeletingBook(true);

    await supabase.from('highlights').delete().eq('book_id', id);
    await supabase.from('reading_sessions').delete().eq('book_id', id);
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      setDeletingBook(false);
    } else {
      router.push('/app/books');
    }
  };

  // ── Edit session ─────────────────────────────────────────────────────────────
  const handleSaveSessionEdit = async () => {
    if (!editingSession || !book) return;
    setSavingSession(true);

    const oldSession = sessions.find((s) => s.id === editingSession.id);
    if (!oldSession) {
      setSavingSession(false);
      return;
    }

    const pagesDelta = editingSession.pages - oldSession.pages_read;

    const { error: sessionError } = await supabase
      .from('reading_sessions')
      .update({ pages_read: editingSession.pages, date: editingSession.date })
      .eq('id', editingSession.id);

    if (sessionError) {
      toast({
        title: 'Erro',
        description: sessionError.message,
        variant: 'destructive',
      });
      setSavingSession(false);
      return;
    }

    const newCurrentPage = Math.max(
      0,
      Math.min(book.total_pages, book.current_page + pagesDelta)
    );
    await supabase
      .from('books')
      .update({ current_page: newCurrentPage })
      .eq('id', id);

    setEditingSession(null);
    toast({ title: 'Sessão atualizada!', variant: 'success' });
    fetchData();
    setSavingSession(false);
  };

  // ── Delete session ───────────────────────────────────────────────────────────
  const handleDeleteSession = async (sessionId: string, pagesRead: number) => {
    if (!book) return;

    const { error } = await supabase
      .from('reading_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const newCurrentPage = Math.max(0, book.current_page - pagesRead);
    await supabase
      .from('books')
      .update({ current_page: newCurrentPage })
      .eq('id', id);

    setDeletingSessionId(null);
    toast({ title: 'Sessão removida.' });
    fetchData();
  };

  if (loading) return <BookDetailsLoadingSkeleton />;

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

  const progress = Math.min(
    100,
    Math.round((book.current_page / book.total_pages) * 100)
  );

  const streak = getStreak(allSessions);

  return (
    <AppShell>
      <div className="space-y-8">
        <Link
          href="/app/books"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Meus Livros
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Book Header */}
            <section className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                {/* Left: cover + info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {book.cover_url && (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      width={72}
                      height={100}
                      className="object-cover rounded-lg shadow-md shrink-0"
                    />
                  )}
                  <div className="space-y-1.5 min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {book.title}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      {book.author}
                    </p>
                    <StarRating
                      value={book.rating}
                      onChange={handleRating}
                      size="md"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <Select
                        value={book.category || 'none'}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="h-8 w-auto min-w-[160px] text-xs">
                          <SelectValue placeholder="Sem categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          <SelectItem value="ficcao">📖 Ficção</SelectItem>
                          <SelectItem value="nao-ficcao">
                            📘 Não-ficção
                          </SelectItem>
                          <SelectItem value="tech">💻 Tecnologia</SelectItem>
                          <SelectItem value="negocios">💼 Negócios</SelectItem>
                          <SelectItem value="autoajuda">🌱 Autoajuda</SelectItem>
                          <SelectItem value="biografia">👤 Biografia</SelectItem>
                          <SelectItem value="fantasia">🐉 Fantasia</SelectItem>
                          <SelectItem value="romance">💕 Romance</SelectItem>
                          <SelectItem value="suspense">🔍 Suspense</SelectItem>
                          <SelectItem value="academico">🎓 Acadêmico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                      book.status === 'reading' && 'bg-primary/10 text-primary',
                      book.status === 'finished' &&
                        'bg-success/10 text-success',
                      book.status === 'wishlist' &&
                        'bg-purple-500/10 text-purple-500',
                      book.status === 'next' && 'bg-sky-500/10 text-sky-500'
                    )}
                  >
                    {book.status === 'reading'
                      ? 'Lendo'
                      : book.status === 'finished'
                        ? 'Finalizado'
                        : book.status === 'wishlist'
                          ? 'Lista de Desejos'
                          : 'Próximo'}
                  </div>
                  {(book.status === 'wishlist' || book.status === 'next') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={handleStartReading}
                    >
                      Começar a Ler
                    </Button>
                  )}
                  {book.status !== 'finished' &&
                    book.status !== 'wishlist' &&
                    book.status !== 'next' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-success/50 text-success hover:bg-success/10 hover:text-success"
                        onClick={handleFinishBook}
                      >
                        Finalizar Livro
                      </Button>
                    )}

                  <SharingCard
                    book={book}
                    sessions={sessions}
                    streak={streak}
                  />

                  {/* Delete book */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir Livro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Excluir "{book.title}"?</DialogTitle>
                        <DialogDescription>
                          Todos os registros de leitura e trechos salvos serão
                          excluídos permanentemente. Esta ação não pode ser
                          desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteBook}
                          disabled={deletingBook}
                        >
                          {deletingBook
                            ? 'Excluindo...'
                            : 'Excluir Permanentemente'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {(book.status === 'reading' || book.status === 'finished') && (
                <div className="space-y-3 pt-6 p-6 rounded-2xl border bg-surface shadow-sm">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Progresso da Leitura</span>
                    <span className="text-foreground">{progress}%</span>
                  </div>
                  <ProgressBar
                    className="h-6"
                    value={progress}
                    indicatorClassName={
                      book.status === 'finished' ? 'bg-success' : 'bg-primary'
                    }
                  />
                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span>Página {book.current_page}</span>
                    <span>Total {book.total_pages} páginas</span>
                  </div>
                </div>
              )}

              {book.status === 'finished' && (
                <div className="space-y-4 pt-6 p-6 rounded-2xl border bg-surface shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Quote className="h-4 w-4 text-primary" /> O que eu
                      aprendi
                    </h2>

                    {!isEditingSummary && summary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => setIsEditingSummary(true)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>

                  {isEditingSummary || !summary ? (
                    <div className="space-y-4">
                      <textarea
                        className="w-full min-h-[150px] rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
                        placeholder="Quais foram suas maiores reflexões e aprendizados com esta leitura?"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        {summary && isEditingSummary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => {
                              setSummary(book.summary || '');
                              setIsEditingSummary(false);
                            }}
                            disabled={savingSummary}
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="rounded-lg px-6 shadow-lg shadow-primary/20 text-xs font-bold"
                          onClick={handleSaveSummary}
                          disabled={
                            savingSummary || (!summary.trim() && !book.summary)
                          }
                        >
                          {savingSummary ? 'Salvando...' : 'Salvar Reflexão'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-4 italic">
                        {summary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Sessions */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Histórico de
                Leitura
              </h2>
              {sessions.length > 0 ? (
                <div className="grid gap-3">
                  {sessions.slice(0, 10).map((session) => {
                    const isEditing = editingSession?.id === session.id;

                    if (isEditing) {
                      return (
                        <div
                          key={session.id}
                          className="p-4 rounded-xl bg-primary/5 border border-primary/30 space-y-3"
                        >
                          <p className="text-xs font-bold uppercase tracking-wider text-primary">
                            Editar sessão
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                                Páginas lidas
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                className="w-28 h-8 text-sm"
                                value={editingSession.pages}
                                onChange={(e) =>
                                  setEditingSession({
                                    ...editingSession,
                                    pages:
                                      parseInt(e.target.value, 10) ||
                                      editingSession.pages,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                                Data
                              </Label>
                              <Input
                                type="date"
                                className="h-8 text-sm"
                                value={editingSession.date}
                                onChange={(e) =>
                                  setEditingSession({
                                    ...editingSession,
                                    date: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={handleSaveSessionEdit}
                              disabled={savingSession}
                            >
                              {savingSession ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => setEditingSession(null)}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={session.id}
                        className="group flex items-center justify-between p-4 rounded-xl bg-surface border shadow-sm hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {session.pages_read} páginas lidas
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(`${session.date}T12:00:00`),
                                "d 'de' MMMM, yyyy",
                                { locale: ptBR }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingSession({
                                id: session.id,
                                pages: session.pages_read,
                                date: session.date,
                              })
                            }
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeletingSessionId(session.id)
                            }
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {highlights.length}
                </span>
              </div>

              <Card className="rounded-2xl border-primary/20 bg-primary/1">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm uppercase tracking-widest text-primary">
                    Novo Trecho
                  </CardTitle>
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
                        <Label
                          htmlFor="page"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Página
                        </Label>
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
                  <div
                    key={highlight.id}
                    className="group relative p-5 rounded-2xl border bg-surface shadow-sm hover:border-primary/40 transition-all duration-200"
                  >
                    <p className="text-sm italic text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      &quot;{highlight.content}&quot;
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t pt-3 border-muted/50">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                        {highlight.page ? `Página ${highlight.page}` : 'Nota'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteHighlight(highlight.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200"
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

      {/* Delete session confirmation dialog */}
      <Dialog
        open={!!deletingSessionId}
        onOpenChange={(open) => {
          if (!open) setDeletingSessionId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir sessão?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O progresso do livro será
              ajustado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                const session = sessions.find(
                  (s) => s.id === deletingSessionId
                );
                if (session) {
                  handleDeleteSession(session.id, session.pages_read);
                }
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
