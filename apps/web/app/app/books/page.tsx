import {
  BookMarked,
  BookOpen,
  BookPlus,
  CheckCircle2,
  Heart,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { BookCategoryFilter } from '@/components/book-category-filter';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';


export default async function BooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const hasAnyBook = books && books.length > 0;

  // Summary counts
  const counts = {
    reading: books?.filter((b) => b.status === 'reading').length ?? 0,
    next: books?.filter((b) => b.status === 'next').length ?? 0,
    wishlist: books?.filter((b) => b.status === 'wishlist').length ?? 0,
    finished: books?.filter((b) => b.status === 'finished').length ?? 0,
    total: books?.length ?? 0,
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Minha Biblioteca
            </h1>
            <p className="text-muted-foreground text-sm">
              {hasAnyBook
                ? `${counts.total} livro${counts.total !== 1 ? 's' : ''} no acervo`
                : 'Sua estante está esperando por você.'}
            </p>
          </div>
          <Button
            asChild
            size="icon"
            className="rounded-full h-10 w-10 shadow-lg shadow-primary/20"
          >
            <Link href="/app/books/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Summary Chips */}
        {hasAnyBook && (
          <div className="flex flex-wrap gap-2">
            {counts.reading > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-3 w-3" /> {counts.reading} lendo
              </span>
            )}
            {counts.next > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-500">
                <BookMarked className="h-3 w-3" /> {counts.next} na fila
              </span>
            )}
            {counts.wishlist > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-500">
                <Heart className="h-3 w-3" /> {counts.wishlist} na lista de
                desejos
              </span>
            )}
            {counts.finished > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-3 w-3" /> {counts.finished}{' '}
                finalizados
              </span>
            )}
          </div>
        )}

        {/* Sections */}
        {hasAnyBook ? (
          <BookCategoryFilter books={books} />
        ) : (
          <EmptyState
            icon={BookPlus}
            title="Sua estante está vazia"
            description="Adicione seu primeiro livro para começar a registrar."
            actionLabel="Adicionar livro"
            actionHref="/app/books/new"
          />
        )}
      </div>
    </AppShell>
  );
}
