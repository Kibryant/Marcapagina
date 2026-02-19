"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NewBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const pages = parseInt(totalPages);
    if (isNaN(pages) || pages <= 0) {
      toast({
        title: "Erro",
        description: "O número total de páginas deve ser maior que 0.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("books").insert({
      user_id: user?.id,
      title,
      author,
      total_pages: pages,
      current_page: 0,
      status: "reading",
    });

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "Sucesso!",
        description: "Livro adicionado com sucesso.",
        variant: "success",
      });
      router.push("/app/books");
      router.refresh();
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/app/books" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Livro</h1>
          <p className="text-muted-foreground">O que você vai ler agora?</p>
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
                <Label htmlFor="totalPages">Total de Páginas</Label>
                <Input
                  id="totalPages"
                  type="number"
                  placeholder="Ex: 96"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <Button
                className="w-full h-12 text-base font-semibold rounded-xl mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Adicionando..." : "Adicionar Livro"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
