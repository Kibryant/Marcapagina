import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Heart, BookMarked } from "lucide-react";

type BookStatus = "reading" | "paused" | "finished" | "wishlist" | "next";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  current_page: number;
  total_pages: number;
  status: BookStatus;
}

const STATUS_CONFIG: Record<BookStatus, { label: string; className: string }> = {
  reading: { label: "Lendo", className: "bg-primary/10 text-primary" },
  paused: { label: "Pausado", className: "bg-warning/10 text-warning" },
  finished: { label: "Finalizado", className: "bg-success/10 text-success" },
  wishlist: { label: "Lista de Desejos", className: "bg-purple-500/10 text-purple-500" },
  next: { label: "Próximo", className: "bg-sky-500/10 text-sky-500" },
};

export function BookCard({ id, title, author, current_page, total_pages, status }: BookCardProps) {
  const progress = total_pages > 0 ? Math.min(100, Math.round((current_page / total_pages) * 100)) : 0;
  const showProgress = status === "reading" || status === "paused" || status === "finished";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.reading;

  return (
    <Link href={`/app/books/${id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden border">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">{title}</h3>
              {author && <p className="text-sm text-muted-foreground line-clamp-1">{author}</p>}
            </div>
            <div className={cn(
              "shrink-0 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
              config.className
            )}>
              {config.label}
            </div>
          </div>

          {showProgress ? (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progresso</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} indicatorClassName={status === "finished" ? "bg-success" : "bg-primary"} />
              <div className="text-[11px] text-muted-foreground text-right font-medium">
                {current_page} / {total_pages} págs
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              {status === "wishlist" ? (
                <Heart className="h-3.5 w-3.5 text-purple-500/60" />
              ) : (
                <BookMarked className="h-3.5 w-3.5 text-sky-500/60" />
              )}
              <span>{total_pages > 0 ? `${total_pages} páginas` : "Páginas não informadas"}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
