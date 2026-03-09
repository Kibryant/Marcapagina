import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BookPlus, Plus, BookOpen, Heart, BookMarked, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type BookStatus = "reading" | "next" | "wishlist" | "finished";

const SECTIONS: {
  status: BookStatus;
  label: string;
  icon: LucideIcon;
  accentClass: string;
  gridOpacity: string;
}[] = [
    { status: "reading", label: "Lendo", icon: BookOpen, accentClass: "text-primary border-primary/30 bg-primary/5", gridOpacity: "" },
    { status: "next", label: "Próximos", icon: BookMarked, accentClass: "text-sky-500 border-sky-500/30 bg-sky-500/5", gridOpacity: "opacity-80" },
    { status: "wishlist", label: "Lista de Desejos", icon: Heart, accentClass: "text-purple-500 border-purple-500/30 bg-purple-500/5", gridOpacity: "opacity-80" },
    { status: "finished", label: "Finalizados", icon: CheckCircle2, accentClass: "text-success border-success/30 bg-success/5", gridOpacity: "opacity-70" },
  ];

export default async function BooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const hasAnyBook = books && books.length > 0;

  // Summary counts
  const counts = {
    reading: books?.filter(b => b.status === "reading").length ?? 0,
    next: books?.filter(b => b.status === "next").length ?? 0,
    wishlist: books?.filter(b => b.status === "wishlist").length ?? 0,
    finished: books?.filter(b => b.status === "finished").length ?? 0,
    total: books?.length ?? 0,
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Minha Biblioteca</h1>
            <p className="text-muted-foreground text-sm">
              {hasAnyBook
                ? `${counts.total} livro${counts.total !== 1 ? "s" : ""} no acervo`
                : "Sua estante está esperando por você."}
            </p>
          </div>
          <Button asChild size="icon" className="rounded-full h-10 w-10 shadow-lg shadow-primary/20">
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
                <Heart className="h-3 w-3" /> {counts.wishlist} na lista de desejos
              </span>
            )}
            {counts.finished > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-3 w-3" /> {counts.finished} finalizados
              </span>
            )}
          </div>
        )}

        {/* Sections */}
        {hasAnyBook ? (
          <div className="space-y-10">
            {SECTIONS.map(({ status, label, icon: Icon, accentClass, gridOpacity }) => {
              const sectionBooks = books.filter(b => b.status === status);
              if (sectionBooks.length === 0) return null;

              return (
                <section key={status} className="space-y-4">
                  {/* Section Header */}
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${accentClass}`}>
                    <Icon className="h-4 w-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider flex-1">{label}</h2>
                    <span className="text-xs font-black tabular-nums opacity-70">{sectionBooks.length}</span>
                  </div>

                  {/* Book Grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${gridOpacity}`}>
                    {sectionBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        author={book.author}
                        current_page={book.current_page}
                        total_pages={book.total_pages}
                        status={book.status}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
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

