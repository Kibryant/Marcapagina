'use client';

import { cn } from '@marcapagina/shared';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  Heart,
  type LucideIcon,
  Search,
  Tag,
} from 'lucide-react';
import { useState } from 'react';
import { BookCard } from '@/components/book-card';
import { Input } from '@/components/ui/input';

type BookStatus = 'reading' | 'next' | 'wishlist' | 'finished';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'ficcao', label: '📖 Ficção' },
  { value: 'nao-ficcao', label: '📘 Não-ficção' },
  { value: 'tech', label: '💻 Tech' },
  { value: 'negocios', label: '💼 Negócios' },
  { value: 'autoajuda', label: '🌱 Autoajuda' },
  { value: 'biografia', label: '👤 Biografia' },
  { value: 'fantasia', label: '🐉 Fantasia' },
  { value: 'romance', label: '💕 Romance' },
  { value: 'suspense', label: '🔍 Suspense' },
  { value: 'academico', label: '🎓 Acadêmico' },
];

const SECTIONS: {
  status: BookStatus;
  label: string;
  icon: LucideIcon;
  accentClass: string;
  gridOpacity: string;
}[] = [
  {
    status: 'reading',
    label: 'Lendo',
    icon: BookOpen,
    accentClass: 'text-primary border-primary/30 bg-primary/5',
    gridOpacity: '',
  },
  {
    status: 'next',
    label: 'Próximos',
    icon: BookMarked,
    accentClass: 'text-sky-500 border-sky-500/30 bg-sky-500/5',
    gridOpacity: 'opacity-80',
  },
  {
    status: 'wishlist',
    label: 'Lista de Desejos',
    icon: Heart,
    accentClass: 'text-purple-500 border-purple-500/30 bg-purple-500/5',
    gridOpacity: 'opacity-80',
  },
  {
    status: 'finished',
    label: 'Finalizados',
    icon: CheckCircle2,
    accentClass: 'text-success border-success/30 bg-success/5',
    gridOpacity: 'opacity-70',
  },
];

interface BookData {
  id: string;
  title: string;
  author: string | null;
  current_page: number;
  total_pages: number;
  status: string;
  category: string | null;
  cover_url?: string | null;
}

interface BookCategoryFilterProps {
  books: BookData[];
}

export function BookCategoryFilter({ books }: BookCategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const availableCategories = CATEGORIES.filter((cat) =>
    books.some((b) => b.category === cat.value)
  );

  const filteredBooks = books.filter((b) => {
    const matchesCategory = activeCategory ? b.category === activeCategory : true;
    const matchesSearch = searchQuery
      ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou autor..."
          className="pl-12 h-14 bg-surface border-border rounded-2xl text-base shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter Chips */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              'text-xs font-bold px-3 py-1.5 rounded-full transition-all border',
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            )}
          >
            Todos
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() =>
                setActiveCategory(activeCategory === cat.value ? null : cat.value)
              }
              className={cn(
                'text-xs font-bold px-3 py-1.5 rounded-full transition-all border',
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Book Sections */}
      <div className="space-y-10">
        {SECTIONS.map(
          ({ status, label, icon: Icon, accentClass, gridOpacity }) => {
            const sectionBooks = filteredBooks.filter(
              (b) => b.status === status
            );
            if (sectionBooks.length === 0) return null;

            return (
              <section key={status} className="space-y-4">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${accentClass}`}
                >
                  <Icon className="h-4 w-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wider flex-1">
                    {label}
                  </h2>
                  <span className="text-xs font-black tabular-nums opacity-70">
                    {sectionBooks.length}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${gridOpacity}`}
                >
                  {sectionBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      current_page={book.current_page}
                      total_pages={book.total_pages}
                      status={book.status as BookStatus}
                      category={book.category}
                      cover_url={book.cover_url}
                    />
                  ))}
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}
