"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Book, Save, Target, Globe, Shield, Download, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ProfilePictureUpload } from "@/components/v4/profile-picture-upload";
import { Profile, Book as BookType } from "@/lib/utils";
import { SettingsLoadingSkeleton } from "@/components/ui/skeletons";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Pick<BookType, "id" | "title">[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { setTheme } = useTheme();

  const supabase = createClient();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      if (profileData?.theme) {
        setTheme(profileData.theme);
      }

      // Fetch books for "Favorite Book" select
      const { data: booksData } = await supabase
        .from("books")
        .select("id, title")
        .order("title");

      setBooks(booksData || []);
    }
    setLoading(false);
  }, [supabase, setTheme]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        username: profile.username,
        favorite_book_id: profile.favorite_book_id,
        goal_pages_per_day: profile.goal_pages_per_day || 0,
        is_public: profile.is_public,
        theme: profile.theme,
      })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setTheme(profile.theme);
      toast({ title: "Sucesso", description: "Perfil atualizado!", variant: "success" });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (newUrl: string) => {
    if (!profile) return;
    setProfile({ ...profile, avatar_url: newUrl });

    // Instantly update DB as well
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Erro", description: "Falha ao salvar a imagem no perfil.", variant: "destructive" });
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Fetch all user related data
      const [
        { data: profileData },
        { data: booksData },
        { data: sessionsData },
        { data: followsData }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("books").select("*").eq("user_id", user.id),
        supabase.from("reading_sessions").select("*").eq("user_id", user.id),
        supabase.from("follows").select("*").or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: profileData,
        books: booksData || [],
        reading_sessions: sessionsData || [],
        follows: followsData || []
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `marcapagina-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Sucesso", description: "Dados exportados com sucesso!", variant: "success" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "Erro na exportação", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Erro na exportação", description: "Um erro desconhecido ocorreu", variant: "destructive" });
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <SettingsLoadingSkeleton />;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm">Gerencie seu perfil e preferências.</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Perfil
              </CardTitle>
              <CardDescription>Como você aparece para os outros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfilePictureUpload
                currentAvatarUrl={profile?.avatar_url || null}
                displayName={profile?.display_name || profile?.username || null}
                onUploadSuccess={handleAvatarUpload}
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Nome de Exibição</Label>
                  <Input
                    id="display_name"
                    value={profile?.display_name || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.username || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                    placeholder="Ex: arthur_leitor"
                  />
                  <p className="text-[11px] text-muted-foreground">3-20 caracteres, letras, números e underline.</p>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="goal_pages_per_day" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Meta Diária (páginas)
                  </Label>
                  <Input
                    id="goal_pages_per_day"
                    type="number"
                    min="0"
                    value={profile?.goal_pages_per_day || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, goal_pages_per_day: e.target.value ? parseInt(e.target.value) : null } : null)}
                    placeholder="Ex: 20"
                  />
                  <p className="text-[11px] text-muted-foreground">Define quantas páginas você planeja ler por dia.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" /> Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favorite_book">Livro Favorito</Label>
                <select
                  id="favorite_book"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={profile?.favorite_book_id || ""}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, favorite_book_id: e.target.value || null } : null)}
                >
                  <option value="">Selecione um livro...</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> Privacidade & Social
                  </CardTitle>
                  <CardDescription>Configure como outros usuários vêem você.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Perfil Público</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Permite que outros vejam seu streak e livro favorito.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => prev ? { ...prev, is_public: !prev.is_public } : null)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        profile?.is_public ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          profile?.is_public ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>

                  {profile?.is_public && (
                    <div className="p-3 rounded-lg bg-surface border border-dashed border-primary/30">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Seu link público:</p>
                      <code className="text-[10px] text-primary break-all">
                        {typeof window !== "undefined" ? window.location.origin : ""}/u/{profile.username}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <select
                  id="theme"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={profile?.theme || "system"}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, theme: e.target.value as "light" | "dark" | "system" } : null)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" /> Backup & Exportação
              </CardTitle>
              <CardDescription>Baixe uma cópia de todos os seus dados para segurança.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Isso incluirá seu perfil, lista de livros, todas as suas sessões de leitura e conexões.
                  O arquivo será baixado no formato JSON.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-primary/20 hover:bg-primary/5"
                  onClick={handleExportData}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4" />
                  {exporting ? "Exportando..." : "Exportar Meus Dados (.json)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full gap-2" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
