// Busca de livros server-side com fallback Open Library.
//
// O autocomplete em /app/books/new ia direto para a Google Books API do
// browser, sem cache, sem retry e com a chave da Google exposta a quem
// inspecionasse a aba Network. Esta rota:
//   - consolida a integração no servidor (uma fonte de verdade);
//   - aproveita o cache HTTP do Next.js (revalidate=3600) — quem busca o
//     mesmo título no dia paga 1x;
//   - mescla resultados do Google Books + Open Library, deduplicando por
//     título+autor e preenchendo pageCount/cover quando uma fonte falha.

import { NextResponse } from 'next/server';

export const revalidate = 3600;

export interface BookSearchResult {
  title: string;
  author: string;
  pageCount: number;
  coverUrl: string;
  source: 'google' | 'openlibrary';
}

interface GoogleBooksVolume {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
}

async function searchGoogleBooks(q: string): Promise<BookSearchResult[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books&langRestrict=pt`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: GoogleBooksVolume[] };
    return (data.items ?? [])
      .map<BookSearchResult>((item) => ({
        title: item.volumeInfo?.title ?? '',
        author: item.volumeInfo?.authors?.[0] ?? '',
        pageCount: item.volumeInfo?.pageCount ?? 0,
        coverUrl: (
          item.volumeInfo?.imageLinks?.thumbnail ??
          item.volumeInfo?.imageLinks?.smallThumbnail ??
          ''
        ).replace('http://', 'https://'),
        source: 'google',
      }))
      .filter((r) => r.title);
  } catch {
    return [];
  }
}

async function searchOpenLibrary(q: string): Promise<BookSearchResult[]> {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5&fields=title,author_name,number_of_pages_median,cover_i`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: OpenLibraryDoc[] };
    return (data.docs ?? [])
      .map<BookSearchResult>((doc) => ({
        title: doc.title ?? '',
        author: doc.author_name?.[0] ?? '',
        pageCount: doc.number_of_pages_median ?? 0,
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : '',
        source: 'openlibrary',
      }))
      .filter((r) => r.title);
  } catch {
    return [];
  }
}

function normalizeKey(title: string, author: string): string {
  return `${title.toLowerCase().trim()}|${author.toLowerCase().trim()}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const [google, openLib] = await Promise.all([
    searchGoogleBooks(q),
    searchOpenLibrary(q),
  ]);

  // Google primeiro: capa costuma ser melhor e títulos em pt-BR mais
  // completos. Open Library entra preenchendo lacunas e como fallback se
  // o Google falhou.
  const seen = new Set<string>();
  const merged: BookSearchResult[] = [];

  for (const result of [...google, ...openLib]) {
    const key = normalizeKey(result.title, result.author);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(result);
  }

  // Enriquecimento: se o Google retornou um livro sem pageCount mas o Open
  // Library tem o mesmo livro com pageCount, usa o número da Open Library.
  for (let i = 0; i < merged.length; i++) {
    if (merged[i].pageCount > 0) continue;
    if (merged[i].source !== 'google') continue;
    const sameInOpenLib = openLib.find(
      (o) =>
        normalizeKey(o.title, o.author) ===
        normalizeKey(merged[i].title, merged[i].author)
    );
    if (sameInOpenLib?.pageCount) {
      merged[i] = { ...merged[i], pageCount: sameInOpenLib.pageCount };
    }
  }

  return NextResponse.json({ results: merged.slice(0, 6) });
}
