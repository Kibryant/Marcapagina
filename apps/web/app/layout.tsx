import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marcapagina.app';
const TITLE = 'Marcapágina · seu hábito de leitura em métricas';
const DESCRIPTION =
  'Registre sessões com timer, acompanhe ritmo e streak, finalize livros e veja sua retrospectiva anual. Em português.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['leitura', 'livros', 'hábito', 'timer', 'streak', 'goodreads'],
  authors: [{ name: 'Marcapágina' }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Marcapágina',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
