'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

export default function NewBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [status, setStatus] = useState<BookStatus>('reading');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const needsPages = status === 'reading';

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
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: O Pequeno Príncipe"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
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
