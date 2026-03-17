# Marcapágina 📚

**Marcapágina** é um rastreador de hábitos de leitura focado em simplicidade, consistência e gamificação. Transforme sua leitura em uma jornada épica.

## 🚀 Principais Funcionalidades

- **Registro de Leitura Imersivo**: Timer com sons de ambiente (Chuva, Café, Biblioteca) para foco total e ritual de leitura.
- **Gamificação & XP**: Ganhe XP a cada página lida e suba de nível para desbloquear medalhas (Badges) exclusivas.
- **Heatmap de Consistência**: Visualização estilo GitHub para acompanhar sua constância nos últimos 180 dias.
- **Sharing Cards**: Gere cards visuais premium do seu progresso para compartilhar no Instagram e Stories.
- **Métricas & Insights**: Acompanhe seu ritmo, streak e receba recomendações baseadas no seu comportamento.
- **Resumos & Reflexões**: Espaço dedicado para salvar aprendizados e citações de cada livro finalizado.
- **Design Premium**: Interface moderna com suporte a **Light** e **Dark Mode**, construída com Tailwind CSS v4.

## 🛠 Tech Stack

- **Framework**: [Next.js 16+](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & [Lucide React](https://lucide.dev)
- **Backend/Auth**: [Supabase](https://supabase.com)
- **Monorepo**: [Turbo](https://turbo.build) & [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **Linting/Formatting**: [Biome](https://biomejs.dev)
- **Geração de Imagens**: [html-to-image](https://github.com/bubkoo/html-to-image)
- **Componentes**: [shadcn/ui](https://ui.shadcn.com) & [Radix UI](https://www.radix-ui.com/)

## 🏗 Estrutura do Projeto (Monorepo)

O projeto utiliza uma arquitetura de monorepo para facilitar o compartilhamento de código entre plataformas:

- `apps/web`: Aplicação principal em Next.js.
- `apps/mobile`: Aplicação móvel (Expo/React Native).
- `packages/shared`: Lógica de negócios, tipos e métricas compartilhadas.

## 🏁 Como Começar

### Pré-requisitos

- Node.js 20+
- Conta no Supabase

### Instalação

1. Clone o repositório
2. Instale as dependências na raiz:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente em `apps/web/.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Inicie o ambiente de desenvolvimento:
   ```bash
   # Inicia tudo (Web e Native)
   npm run dev

   # Apenas Web
   npm run web:dev
   ```

## 🔒 Privacidade

Marcapágina permite perfis públicos, mas você tem controle total sobre o que deseja exibir através das configurações de privacidade.

---

© 2026 Marcapágina.
