'use client';

import type { YearStoryData } from '@marcapagina/shared';
import { toPng } from 'html-to-image';
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  Flame,
  Share2,
  Star,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface YearInBooksCardProps {
  data: YearStoryData;
  displayName: string | null;
}

export function YearInBooksCard({ data, displayName }: YearInBooksCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);

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
      link.download = `marcapagina-${data.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const reader = displayName || 'Leitor';
  const topBook = data.topBooks[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Share2 className="h-4 w-4" /> Compartilhar Retrospectiva
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-transparent border-none p-0 overflow-hidden shadow-none">
        <DialogHeader className="bg-surface/90 backdrop-blur-xl p-4 border-b">
          <DialogTitle>Sua Retrospectiva {data.year}</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center gap-6">
          <div
            ref={cardRef}
            className="w-[350px] aspect-4/5 bg-linear-to-br from-[#1a1c1e] to-[#0a0a0a] rounded-[32px] overflow-hidden relative border border-white/10 shadow-2xl p-7 flex flex-col justify-between"
          >
            <div className="absolute top-[-10%] right-[-10%] w-44 h-44 bg-primary/25 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-15%] left-[-15%] w-52 h-52 bg-primary/15 rounded-full blur-[70px]" />

            {/* Header */}
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">
                Marcapágina · {data.year}
              </p>
              <h4 className="text-3xl font-black text-white leading-tight">
                Sua Jornada Literária
              </h4>
              <p className="text-xs text-white/40 font-medium">
                Um ano nos livros — {reader}
              </p>
            </div>

            {/* Hero numbers */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <BookOpen className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Páginas
                  </span>
                </div>
                <p className="text-3xl font-black text-white leading-none">
                  {data.totalPages.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Livros
                  </span>
                </div>
                <p className="text-3xl font-black text-white leading-none">
                  {data.booksFinished}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Horas
                  </span>
                </div>
                <p className="text-3xl font-black text-white leading-none">
                  {data.totalHours}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Flame className="h-3 w-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    Streak
                  </span>
                </div>
                <p className="text-3xl font-black text-white leading-none">
                  {data.longestStreak}
                  <span className="text-xs font-medium text-white/40 ml-1">
                    dias
                  </span>
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="relative z-10 space-y-2">
              {topBook && (
                <div className="flex items-center gap-2 text-white/70 text-[11px]">
                  <Star className="h-3 w-3 text-primary fill-current shrink-0" />
                  <span>
                    Favorito:{' '}
                    <span className="font-bold text-white">
                      {topBook.title}
                    </span>
                  </span>
                </div>
              )}
              {data.bestMonth && (
                <div className="flex items-center gap-2 text-white/70 text-[11px]">
                  <Calendar className="h-3 w-3 text-primary shrink-0" />
                  <span>
                    Melhor mês:{' '}
                    <span className="font-bold text-white capitalize">
                      {data.bestMonth.name}
                    </span>{' '}
                    ({data.bestMonth.pages} págs)
                  </span>
                </div>
              )}
              {data.topCategory && (
                <div className="flex items-center gap-2 text-white/70 text-[11px]">
                  <BookOpen className="h-3 w-3 text-primary shrink-0" />
                  <span>
                    Você curtiu:{' '}
                    <span className="font-bold text-white">
                      {data.topCategory.label}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="relative z-10 pt-3 flex justify-between items-center border-t border-white/5">
              <p className="text-[9px] text-white/30 font-medium">
                marcapagina.app
              </p>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">
                  Wrapped {data.year}
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
