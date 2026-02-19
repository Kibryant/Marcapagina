import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getMonthPages, getStreak } from "@/lib/metrics";
import { Book, Flame, Trophy } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, favorite_book:books(title, author)")
    .eq("username", username)
    .single();

  if (!profile || !profile.is_public) {
    notFound();
  }

  // Fetch sessions for streak and pages
  const { data: sessions } = await supabase
    .from("reading_sessions")
    .select("*")
    .eq("user_id", profile.id)
    .order("date", { ascending: false });

  const sessionList = sessions || [];
  const monthPages = getMonthPages(sessionList);
  const streak = getStreak(sessionList);

  return (
    <AppShell hideNav>
      <div className="max-w-md mx-auto space-y-8 pt-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-surface shadow-xl">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{profile.display_name}</h1>
            <p className="text-muted-foreground">Leitor no Marcapágina</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-surface p-6 flex flex-col items-center gap-2 shadow-sm border-orange-500/20 bg-orange-500/5">
            <Flame className="h-6 w-6 text-orange-500" />
            <div className="text-3xl font-black">{streak}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dias de Streak</div>
          </div>
          <div className="rounded-2xl border bg-surface p-6 flex flex-col items-center gap-2 shadow-sm border-primary/20 bg-primary/5">
            <Trophy className="h-6 w-6 text-primary" />
            <div className="text-3xl font-black">{monthPages}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Páginas no Mês</div>
          </div>
        </div>

        {profile.favorite_book && (
          <div className="rounded-2xl border bg-surface p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Book className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Livro Favorito</span>
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">{profile.favorite_book.title}</h3>
              <p className="text-sm text-muted-foreground">{profile.favorite_book.author}</p>
            </div>
          </div>
        )}

        <div className="text-center pt-10">
          <Link
            href="/"
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Começar a rastrear meus livros também
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
