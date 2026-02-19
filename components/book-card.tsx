import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  current_page: number;
  total_pages: number;
  status: "reading" | "paused" | "finished";
}

export function BookCard({ id, title, author, current_page, total_pages, status }: BookCardProps) {
  const progress = Math.min(100, Math.round((current_page / total_pages) * 100));

  return (
    <Link href={`/app/books/${id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden border">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">{title}</h3>
              {author && <p className="text-sm text-muted-foreground line-clamp-1">{author}</p>}
            </div>
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider",
              status === "reading" && "bg-primary/10 text-primary",
              status === "paused" && "bg-warning/10 text-warning",
              status === "finished" && "bg-success/10 text-success"
            )}>
              {status === "reading" ? "Lendo" : status === "paused" ? "Pausado" : "Lido"}
            </div>
          </div>

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
        </CardContent>
      </Card>
    </Link>
  );
}
