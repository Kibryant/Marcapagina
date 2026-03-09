"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookX, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
        <BookX className="h-24 w-24 text-primary relative" />
      </div>

      <h1 className="text-4xl font-black tracking-tighter mb-4 sm:text-5xl">
        Ops! Página não encontrada.
      </h1>

      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Parece que este capítulo ainda não foi escrito ou a página se perdeu na biblioteca.
      </p>

      <Button asChild size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20">
        <Link href="/">
          <ArrowLeft className="h-5 w-5" /> Voltar ao Início
        </Link>
      </Button>

      <p className="mt-20 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
        Erro 404 • Marcapágina
      </p>
    </div>
  )
}
