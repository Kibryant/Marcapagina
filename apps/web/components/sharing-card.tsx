import type { Book, ReadingSession } from '@marcapagina/shared';
import { toPng } from 'html-to-image';
import { BookOpen, Download, Share2, Star, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SharingCardProps {
  book: Book;
  sessions: ReadingSession[];
  streak: number;
}

export function SharingCard({ book, sessions, streak }: SharingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const totalPagesRead = sessions.reduce((sum, s) => sum + s.pages_read, 0);
  const progress = Math.round((book.current_page / book.total_pages) * 100);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `marcapagina-${book.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-transparent border-none p-0 overflow-hidden shadow-none">
        <DialogHeader className="bg-surface/90 backdrop-blur-xl p-4 border-b">
          <DialogTitle>Compartilhar Jornada</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* THE CARD (Target for html-to-image) */}
          <div
            ref={cardRef}
            className="w-[350px] aspect-4/5 bg-linear-to-br from-[#1a1c1e] to-[#0a0a0a] rounded-[32px] overflow-hidden relative border border-white/10 shadow-2xl p-8 flex flex-col justify-between"
          >
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                  Marcapágina
                </p>
                <h4 className="text-xl font-bold text-white leading-tight max-w-[200px] line-clamp-2">
                  {book.title}
                </h4>
                <p className="text-xs text-white/40 font-medium">
                  por {book.author || 'Autor desconhecido'}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Center Stats */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <title>{progress}%</title>
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - progress / 100)}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">
                    {progress}%
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
                    Concluído
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Leitura
                  </span>
                </div>
                <p className="text-lg font-bold text-white leading-none">
                  {totalPagesRead}{' '}
                  <span className="text-[10px] font-medium text-white/40">
                    págs
                  </span>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Trophy className="h-3 w-3 fill-current" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Streak
                  </span>
                </div>
                <p className="text-lg font-bold text-white leading-none">
                  {streak}{' '}
                  <span className="text-[10px] font-medium text-white/40">
                    dias
                  </span>
                </p>
              </div>
            </div>

            {/* Footer Footer */}
            <div className="relative z-10 pt-4 flex justify-between items-center border-t border-white/5">
              <p className="text-[9px] text-white/30 font-medium">
                Jornada Literária 2026
              </p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">
                  Active
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-bold gap-2"
          >
            {isGenerating ? (
              'Gerando...'
            ) : (
              <>
                <Download className="h-4 w-4" /> Baixar Imagem
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
