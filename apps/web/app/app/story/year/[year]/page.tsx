import { getProfile, listBooks, listSessions } from '@marcapagina/data';
import { generateYearStoryData } from '@marcapagina/shared';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  Flame,
  Star,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { StoryCard } from '@/components/story-card';
import { YearInBooksCard } from '@/components/year-in-books-card';
import { createClient } from '@/lib/supabase/server';

interface YearStoryPageProps {
  params: Promise<{ year: string }>;
}

export default async function YearStoryPage({ params }: YearStoryPageProps) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? '';

  const [profile, sessions, books] = await Promise.all([
    getProfile(supabase, userId),
    listSessions(supabase, userId),
    listBooks(supabase, userId),
  ]);

  const data = generateYearStoryData(sessions, books, year);
  const hasData = data.totalSessions > 0;

  return (
    <AppShell>
      <div className="space-y-10">
        <div className="space-y-3">
          <Link
            href="/app/story"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Sua História
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Sua Retrospectiva {year}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {hasData
                  ? `Um ano nos livros, ${profile?.display_name || 'leitor'}.`
                  : `Sem leituras registradas em ${year}.`}
              </p>
            </div>

            {hasData && (
              <YearInBooksCard
                data={data}
                displayName={profile?.display_name ?? null}
              />
            )}
          </div>
        </div>

        {!hasData ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nada para mostrar ainda. Registre algumas sessões em {year} e
              volte aqui.
            </p>
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Em números
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StoryCard
                  title="Páginas"
                  value={data.totalPages.toLocaleString('pt-BR')}
                  description="lidas no ano inteiro"
                  icon={<BookOpen className="h-4 w-4" />}
                  highlight
                />
                <StoryCard
                  title="Livros"
                  value={data.booksFinished}
                  description={
                    data.booksFinished === 1
                      ? 'finalizado'
                      : 'finalizados no ano'
                  }
                  icon={<Star className="h-4 w-4" />}
                />
                <StoryCard
                  title="Horas"
                  value={data.totalHours}
                  description="de leitura registradas"
                  icon={<Clock className="h-4 w-4" />}
                />
                <StoryCard
                  title="Maior streak"
                  value={`${data.longestStreak} dias`}
                  description="seguidos lendo"
                  icon={<Flame className="h-4 w-4" />}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Seu ritmo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StoryCard
                  title="Dias lendo"
                  value={data.activeDays}
                  description="com pelo menos uma página"
                  icon={<Calendar className="h-4 w-4" />}
                />
                <StoryCard
                  title="Média por dia ativo"
                  value={`${data.averagePagesPerActiveDay} págs`}
                  description="só os dias que você leu"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <StoryCard
                  title="Melhor mês"
                  value={
                    data.bestMonth
                      ? data.bestMonth.name.replace(/^\w/, (c) =>
                          c.toUpperCase()
                        )
                      : '—'
                  }
                  description={
                    data.bestMonth
                      ? `${data.bestMonth.pages} páginas`
                      : 'sem dados'
                  }
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>
            </section>

            {data.topCategory && (
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Você curtiu
                </h2>
                <div className="rounded-2xl border bg-surface p-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Categoria mais lida
                  </p>
                  <p className="text-2xl font-black mt-1">
                    {data.topCategory.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.topCategory.pages.toLocaleString('pt-BR')} páginas
                    nessa categoria
                  </p>
                </div>
              </section>
            )}

            {data.topBooks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Seus favoritos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.topBooks.map((book, idx) => (
                    <Link
                      key={book.id}
                      href={`/app/books/${book.id}`}
                      className="group rounded-2xl border bg-surface p-5 hover:border-primary/40 transition-colors flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5 text-primary">
                          {Array.from({ length: book.rating }).map((_, i) => (
                            <Star
                              // biome-ignore lint/suspicious/noArrayIndexKey: rendering fixed stars
                              key={i}
                              className="h-3 w-3 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {book.author}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
