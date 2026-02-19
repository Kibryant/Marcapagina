import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BookPlus, Plus } from "lucide-react";
import Link from "next/link";

export default async function BooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user?.id)
    .order("status", { ascending: false }) // 'reading' comes before 'finished'
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meus Livros</h1>
            <p className="text-muted-foreground">Sua biblioteca pessoal.</p>
          </div>
          <Button asChild size="icon" className="rounded-full h-10 w-10">
            <Link href="/app/books/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {books && books.length > 0 ? (
          <div className="space-y-8">
            {/* Reading Group */}
            {books.some(b => b.status === "reading") && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lendo</h2>
                <div className="flex flex-col gap-4">
                  {books.filter(b => b.status === "reading").map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      current_page={book.current_page}
                      total_pages={book.total_pages}
                      status={book.status as any}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Others Group */}
            {books.some(b => b.status !== "reading") && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Próximos / Finalizados</h2>
                <div className="space-y-4 opacity-70">
                  {books.filter(b => b.status !== "reading").map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      current_page={book.current_page}
                      total_pages={book.total_pages}
                      status={book.status as any}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
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
