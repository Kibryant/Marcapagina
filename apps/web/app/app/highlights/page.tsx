import { listHighlightsByUser } from '@marcapagina/data';
import { Quote } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { HighlightsList } from '@/components/highlights-list';
import { createClient } from '@/lib/supabase/server';

export default async function HighlightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const highlights = await listHighlightsByUser(supabase, user?.id ?? '');

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Citações 💬</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {highlights.length > 0
              ? `${highlights.length} trecho${highlights.length !== 1 ? 's' : ''} salvo${highlights.length !== 1 ? 's' : ''} dos seus livros.`
              : 'Salve trechos marcantes dos livros que você lê.'}
          </p>
        </div>

        {highlights.length > 0 ? (
          <HighlightsList highlights={highlights} />
        ) : (
          <EmptyState
            icon={Quote}
            title="Nenhuma citação ainda"
            description="Abra um livro e use o painel 'Trechos & Notas' para começar."
            actionLabel="Ver meus livros"
            actionHref="/app/books"
          />
        )}
      </div>
    </AppShell>
  );
}
