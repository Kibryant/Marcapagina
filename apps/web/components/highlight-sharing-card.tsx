'use client';

import { toPng } from 'html-to-image';
import { Download, Quote, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HighlightSharingCardProps {
  content: string;
  bookTitle: string;
  bookAuthor?: string | null;
  page?: number | null;
  /** Quando o gatilho é um ícone numa lista, o botão padrão pode não caber. */
  trigger?: React.ReactNode;
}

export function HighlightSharingCard({
  content,
  bookTitle,
  bookAuthor,
  page,
  trigger,
}: HighlightSharingCardProps) {
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
      const slug = bookTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const link = document.createElement('a');
      link.download = `marcapagina-citacao-${slug || 'trecho'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajuste do tamanho do texto pra trechos longos não estourarem o card.
  const len = content.length;
  const quoteSizeClass =
    len > 240
      ? 'text-base leading-relaxed'
      : len > 120
        ? 'text-lg leading-relaxed'
        : 'text-2xl leading-snug';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2" size="sm">
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-transparent border-none p-0 overflow-hidden shadow-none">
        <DialogHeader className="bg-surface/90 backdrop-blur-xl p-4 border-b">
          <DialogTitle>Compartilhar trecho</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* O CARD (alvo do html-to-image) */}
          <div
            ref={cardRef}
            className="w-[350px] aspect-4/5 bg-linear-to-br from-[#1a1c1e] to-[#0a0a0a] rounded-[32px] overflow-hidden relative border border-white/10 shadow-2xl p-8 flex flex-col justify-between"
          >
            <div className="absolute top-[-10%] right-[-10%] w-44 h-44 bg-primary/20 rounded-full blur-[70px]" />
            <div className="absolute bottom-[-15%] left-[-10%] w-48 h-48 bg-primary/10 rounded-full blur-[70px]" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                Marcapágina
              </p>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <Quote className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Trecho */}
            <div className="relative z-10 flex-1 flex items-center my-4">
              <p
                className={`font-serif italic text-white text-balance ${quoteSizeClass} line-clamp-[10]`}
              >
                &ldquo;{content}&rdquo;
              </p>
            </div>

            {/* Atribuição */}
            <div className="relative z-10 space-y-3">
              <div className="h-px w-12 bg-primary/60" />
              <div>
                <p className="text-base font-bold text-white leading-tight line-clamp-2">
                  {bookTitle}
                </p>
                {bookAuthor && (
                  <p className="text-xs text-white/40 font-medium mt-0.5">
                    {bookAuthor}
                  </p>
                )}
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-white/5">
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-widest">
                  {page ? `Página ${page}` : 'Anotação'}
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[9px] text-primary font-bold uppercase tracking-widest">
                    Quote
                  </span>
                </div>
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
