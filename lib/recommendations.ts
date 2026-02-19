import { Insight } from "./insights";

export interface Recommendation {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function getHabitRecommendations(insights: Insight[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  insights.forEach(insight => {
    if (insight.type === "time") {
      if (insight.title.includes("à noite")) {
        recommendations.push({
          title: "Proteja seus 15 min",
          description: "Já que você lê melhor à noite, tente colocar um lembrete para as 21:30.",
        });
      } else if (insight.title.includes("pela manhã")) {
        recommendations.push({
          title: "Café com leitura",
          description: "Aproveite seu café para avançar pelo menos 5 páginas.",
        });
      }
    }

    if (insight.type === "consistency" && insight.title.includes("final de semana")) {
      recommendations.push({
        title: "Doses diárias",
        description: "Tente ler apenas 5 páginas na segunda-feira para manter o hábito vivo após o domingo.",
      });
    }
  });

  return recommendations.slice(0, 1); // Keep it simple: 1 rec
}

interface Book {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  total_pages: number;
}

export function getBookRecommendations(books: Book[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  // Find inactive books (not updated in 10 days)
  const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
  const inactiveBook = books.find(b => {
    if (b.status !== "reading") return false;
    const updatedAt = new Date(b.updated_at);
    return now.getTime() - updatedAt.getTime() > tenDaysInMs;
  });

  if (inactiveBook) {
    recommendations.push({
      title: "Vamos retomar?",
      description: `\"${inactiveBook.title}\" está na mesma página há 10 dias. Tente ler só 2 páginas hoje.`,
      actionLabel: "Ver livro",
      actionHref: `/app/books/${inactiveBook.id}`,
    });
  }

  // Find short books (if the user typically finishes longer ones, suggest clear goals)
  // Or just a general tip
  if (recommendations.length === 0 && books.length > 0) {
    const reading = books.find(b => b.status === "reading");
    if (reading) {
      recommendations.push({
        title: "Meta de curto prazo",
        description: "Que tal tentar terminar este capítulo ainda hoje?",
        actionLabel: "Ver livro",
        actionHref: `/app/books/${reading.id}`,
      });
    }
  }

  return recommendations.slice(0, 1);
}
