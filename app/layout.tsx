import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marcapágina",
  description: "Acompanhe seu progresso, registre sessões com timer e descubra estatísticas surpreendentes sobre seu hábito de leitura.",
  keywords: ["leitura", "timer", "estatísticas", "hábito", "leitura", "timer", "estatísticas", "hábito", "leitura", "timer", "estatísticas", "hábito"],
  authors: [{ name: "Arthur" }],
  openGraph: {
    title: "Marcapágina",
    description: "Acompanhe seu progresso, registre sessões com timer e descubra estatísticas surpreendentes sobre seu hábito de leitura.",
    type: "website",
    locale: "pt-BR",
    siteName: "Marcapágina",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
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
