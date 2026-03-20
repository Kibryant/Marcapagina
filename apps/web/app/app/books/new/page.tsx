'use client';

import { ChevronLeft, Loader2, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

type BookStatus = 'reading' | 'wishlist' | 'next';

interface GoogleBooksResult {
  title: string;
  author: string;
  pageCount: number;
  coverUrl: string;
}

export default function NewBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [status, setStatus] = useState<BookStatus>('reading');
  const [category, setCategory] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Books search
  const [searchResults, setSearchResults] = useState<GoogleBooksResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const needsPages = status === 'reading';

  // Debounced search on title input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (title.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5`
        );
        const data = await res.json();
        const results: GoogleBooksResult[] = (data.items || []).map(
          (item: {
            volumeInfo: {
              title?: string;
              authors?: string[];
              pageCount?: number;
              imageLinks?: { thumbnail?: string };
            };
          }) => ({
            title: item.volumeInfo.title || '',
            author: item.volumeInfo.authors?.[0] || '',
            pageCount: item.volumeInfo.pageCount || 0,
            coverUrl:
              item.volumeInfo.imageLinks?.thumbnail?.replace(
                'http://',
                'https://'
              ) || '',
          })
        );
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        // silently fail — user can fill manually
      }
      setIsSearching(false);
    }, 400);
  }, [title]);

  const handleSelectResult = (result: GoogleBooksResult) => {
    setTitle(result.title);
    setAuthor(result.author);
    if (result.pageCount > 0) setTotalPages(String(result.pageCount));
    setCoverUrl(result.coverUrl);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const pages = totalPages ? parseInt(totalPages, 10) : 0;

    if (needsPages && (Number.isNaN(pages) || pages <= 0)) {
      toast({
        title: 'Erro',
        description: 'O número total de páginas deve ser maior que 0.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('books').insert({
      user_id: user?.id,
      title,
      author,
      total_pages: pages,
      current_page: 0,
      status,
      category: category || null,
      cover_url: coverUrl || null,
    });

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Livro adicionado com sucesso.',
        variant: 'success',
      });
      router.push('/app/books');
      router.refresh();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          href="/app/books"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Livro</h1>
          <p className="text-muted-foreground">
            Adicione um livro à sua estante.
          </p>
        </div>

        <Card>
          <form onSubmit={handleCreate}>
            <CardContent className="pt-6 space-y-4">
              {/* Title with Google Books autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="title"
                      placeholder="Ex: O Pequeno Príncipe"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 200)
                      }
                      onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                      }}
                      className="pl-9 pr-9"
                      required
                      autoComplete="off"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!isSearching && title && (
                      <button
                        type="button"
                        onClick={() => {
                          setTitle('');
                          setCoverUrl('');
                          setSearchResults([]);
                          setShowDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 w-full rounded-xl border bg-background shadow-lg overflow-hidden">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.title}-${result.author}-${result.pageCount}`}
                          type="button"
                          onMouseDown={() => handleSelectResult(result)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                        >
                          {result.coverUrl ? (
                            <Image
                              src={result.coverUrl}
                              alt={result.title}
                              width={36}
                              height={48}
                              className="object-cover rounded shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">
                              {result.title}
                            </p>
                            {result.author && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {result.author}
                              </p>
                            )}
                            {result.pageCount > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {result.pageCount} páginas
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Digite para buscar automaticamente no Google Books.
                </p>
              </div>

              {/* Cover preview */}
              {coverUrl && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                  <Image
                    src={coverUrl}
                    alt="Capa"
                    width={40}
                    height={56}
                    className="object-cover rounded shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Capa encontrada
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Importada do Google Books
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  placeholder="Ex: Antoine de Saint-Exupéry"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Onde fica na sua estante?</Label>
                <Select
                  value={status}
                  onValueChange={(v: BookStatus) => setStatus(v)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">
                      📖 Estou lendo agora
                    </SelectItem>
                    <SelectItem value="next">
                      🔜 Vou ler em breve (Próximos)
                    </SelectItem>
                    <SelectItem value="wishlist">
                      💜 Quero ler um dia (Lista de Desejos)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria{' '}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(v: string) => setCategory(v)}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ficcao">📖 Ficção</SelectItem>
                    <SelectItem value="nao-ficcao">📘 Não-ficção</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="totalPages">
                  Total de Páginas{' '}
                  {!needsPages && (
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  )}
                </Label>
                <Input
                  id="totalPages"
                  type="number"
                  placeholder="Ex: 96"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  required={needsPages}
                  min="1"
                />
              </div>

              <Button
                className="w-full h-12 text-base font-semibold rounded-xl mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Adicionando...' : 'Adicionar Livro'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
