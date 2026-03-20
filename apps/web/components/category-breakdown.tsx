import { type Book, cn } from '@marcapagina/shared';
import { Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryBreakdownProps {
  books: Book[];
}

const CATEGORIES: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  ficcao: { label: '📖 Ficção', colorClass: 'bg-primary', bgClass: 'bg-primary/10 text-primary' },
  'nao-ficcao': { label: '📘 Não-ficção', colorClass: 'bg-blue-500', bgClass: 'bg-blue-500/10 text-blue-500' },
  tech: { label: '💻 Tech', colorClass: 'bg-emerald-500', bgClass: 'bg-emerald-500/10 text-emerald-500' },
  negocios: { label: '💼 Negócios', colorClass: 'bg-amber-500', bgClass: 'bg-amber-500/10 text-amber-500' },
  autoajuda: { label: '🌱 Autoajuda', colorClass: 'bg-lime-500', bgClass: 'bg-lime-500/10 text-lime-500' },
  biografia: { label: '👤 Biografia', colorClass: 'bg-indigo-500', bgClass: 'bg-indigo-500/10 text-indigo-500' },
  fantasia: { label: '🐉 Fantasia', colorClass: 'bg-violet-500', bgClass: 'bg-violet-500/10 text-violet-500' },
  romance: { label: '💕 Romance', colorClass: 'bg-pink-500', bgClass: 'bg-pink-500/10 text-pink-500' },
  suspense: { label: '🔍 Suspense', colorClass: 'bg-stone-500', bgClass: 'bg-stone-500/10 text-stone-500' },
  academico: { label: '🎓 Acadêmico', colorClass: 'bg-cyan-500', bgClass: 'bg-cyan-500/10 text-cyan-500' },
};

export function CategoryBreakdown({ books }: CategoryBreakdownProps) {
  const booksWithCategory = books.filter((b) => b.category);
  const totalCategorized = booksWithCategory.length;

  if (totalCategorized === 0) return null;

  // Aggregate counts
  const counts = booksWithCategory.reduce(
    (acc, book) => {
      const cat = book.category || 'unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Sort categories by count (descending)
  const sortedCategories = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Take top 5

  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Onde você mais lê</CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Categorias favoritas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-4">
          {/* Progress bar visual */}
          <div className="h-2 w-full rounded-full overflow-hidden flex gap-0.5">
            {sortedCategories.map(([cat, count]) => {
              const width = `${(count / totalCategorized) * 100}%`;
              const config = CATEGORIES[cat];
              if (!config) return null;
              return (
                <div
                  key={cat}
                  className={cn('h-full', config.colorClass)}
                  style={{ width }}
                  title={`${config.label}: ${count} livro${count > 1 ? 's' : ''}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5">
            {sortedCategories.map(([cat, count]) => {
              const config = CATEGORIES[cat];
              if (!config) return null;
              const percentage = Math.round((count / totalCategorized) * 100);

              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', config.colorClass)} />
                    <span className="font-medium text-foreground text-xs">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{count}</span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center min-w-[32px]', config.bgClass)}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
