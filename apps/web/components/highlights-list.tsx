'use client';

import {
  deleteHighlight,
  type HighlightWithBook,
  updateHighlight,
} from '@marcapagina/data';
import { Check, Pencil, Quote, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface HighlightsListProps {
  highlights: HighlightWithBook[];
}

export function HighlightsList({ highlights: initial }: HighlightsListProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState(initial);
  const [query, setQuery] = useState('');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id: string;
    content: string;
    page: string;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Livros distintos para o filtro — preserva a ordem de aparição.
  const bookOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const h of highlights) {
      if (h.book && !seen.has(h.book.id)) {
        seen.set(h.book.id, h.book.title);
      }
    }
    return Array.from(seen, ([id, title]) => ({ id, title }));
  }, [highlights]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return highlights.filter((h) => {
      if (bookFilter !== 'all' && h.book?.id !== bookFilter) return false;
      if (!q) return true;
      return (
        h.content.toLowerCase().includes(q) ||
        (h.book?.title ?? '').toLowerCase().includes(q) ||
        (h.book?.author ?? '').toLowerCase().includes(q)
      );
    });
  }, [highlights, query, bookFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHighlight(supabase, id);
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      toast({ title: 'Trecho excluído.' });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro inesperado',
        variant: 'destructive',
      });
    }
    setDeletingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const content = editing.content.trim();
    if (!content) return;
    setSavingEdit(true);
    const page = editing.page ? parseInt(editing.page, 10) : null;
    try {
      await updateHighlight(supabase, editing.id, { content, page });
      setHighlights((prev) =>
        prev.map((h) => (h.id === editing.id ? { ...h, content, page } : h))
      );
      toast({ title: 'Trecho atualizado!', variant: 'success' });
      setEditing(null);
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro inesperado',
        variant: 'destructive',
      });
    }
    setSavingEdit(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por trecho, livro ou autor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        {bookOptions.length > 1 && (
          <Select value={bookFilter} onValueChange={setBookFilter}>
            <SelectTrigger className="sm:w-64 rounded-xl">
              <SelectValue placeholder="Todos os livros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os livros</SelectItem>
              {bookOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-2xl text-center border border-dashed">
          Nenhum trecho encontrado.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((highlight) => (
            <article
              key={highlight.id}
              className="group relative flex flex-col p-5 rounded-2xl border bg-surface shadow-sm hover:border-primary/40 transition-all duration-200"
            >
              <Quote className="h-5 w-5 text-muted-foreground/40 mb-2" />
              <p className="text-sm italic text-foreground/90 whitespace-pre-wrap leading-relaxed flex-1">
                &quot;{highlight.content}&quot;
              </p>
              <div className="mt-4 flex items-center justify-between border-t pt-3 border-muted/50 gap-2">
                <div className="min-w-0 flex-1">
                  {highlight.book ? (
                    <Link
                      href={`/app/books/${highlight.book.id}`}
                      className="block text-xs font-bold text-foreground truncate hover:text-primary transition-colors"
                    >
                      {highlight.book.title}
                    </Link>
                  ) : (
                    <span className="block text-xs font-bold text-muted-foreground truncate">
                      Livro removido
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    {highlight.page ? `Página ${highlight.page}` : 'Nota'}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        id: highlight.id,
                        content: highlight.content,
                        page: highlight.page ? String(highlight.page) : '',
                      })
                    }
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(highlight.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar trecho</DialogTitle>
            <DialogDescription>
              Ajuste o conteúdo ou a página deste trecho.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conteúdo
                </Label>
                <textarea
                  className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Página
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={editing.page}
                  onChange={(e) =>
                    setEditing({ ...editing, page: e.target.value })
                  }
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveEdit}
              disabled={savingEdit || !editing?.content.trim()}
            >
              <Check className="h-4 w-4 mr-1" />
              {savingEdit ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir trecho?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
