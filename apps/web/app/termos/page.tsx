import { BookOpen, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso · Marcapágina',
  description: 'Termos de uso do Marcapágina — beta aberto, em português.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="container mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-black tracking-tighter">Marcapágina</span>
          </Link>
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
        <h1 className="text-3xl font-black tracking-tight">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="space-y-4 mt-8 text-sm leading-relaxed">
          <h2 className="text-xl font-bold">1. Sobre o serviço</h2>
          <p>
            Marcapágina (&quot;o serviço&quot;) é um rastreador de hábito de
            leitura em beta aberto, operado individualmente pelo desenvolvedor.
            Ao criar uma conta, você concorda com estes termos.
          </p>

          <h2 className="text-xl font-bold">2. Beta e disponibilidade</h2>
          <p>
            O serviço está em fase beta. Pode apresentar bugs, sofrer
            indisponibilidades pontuais e mudar funcionalidades sem aviso
            prévio. Não oferecemos garantia de disponibilidade contínua.
          </p>

          <h2 className="text-xl font-bold">3. Sua conta</h2>
          <p>
            Você é responsável por manter a confidencialidade da sua senha e por
            toda atividade realizada na sua conta. Avise imediatamente se
            suspeitar de acesso não autorizado.
          </p>

          <h2 className="text-xl font-bold">4. Conteúdo do usuário</h2>
          <p>
            Você mantém propriedade integral do conteúdo que registra (livros,
            sessões, trechos, anotações). Concede ao serviço apenas a licença
            técnica necessária para armazenar e exibir seus dados para você.
          </p>
          <p>
            Conteúdo marcado como público (perfil, citações compartilhadas) pode
            ser visualizado por terceiros. Conteúdo privado é protegido por Row
            Level Security no banco de dados.
          </p>

          <h2 className="text-xl font-bold">5. Conduta</h2>
          <p>
            É proibido usar o serviço para: violar leis aplicáveis; hospedar
            conteúdo ilegal, ofensivo ou que infrinja direitos de terceiros;
            tentar acesso não autorizado a contas alheias ou à infraestrutura;
            abusar de APIs (scraping massivo, denial of service).
          </p>

          <h2 className="text-xl font-bold">6. Encerramento</h2>
          <p>
            Você pode excluir sua conta a qualquer momento — isso remove seus
            dados pessoais e de leitura do banco. Podemos suspender contas que
            violem estes termos.
          </p>

          <h2 className="text-xl font-bold">
            7. Limitação de responsabilidade
          </h2>
          <p>
            O serviço é fornecido &quot;como está&quot;. Não nos
            responsabilizamos por perda de dados, lucros cessantes ou danos
            indiretos decorrentes do uso. Faça backup periódico do que for
            crítico para você.
          </p>

          <h2 className="text-xl font-bold">8. Mudanças nestes termos</h2>
          <p>
            Podemos atualizar estes termos. Mudanças relevantes serão
            comunicadas no app ou por email com antecedência razoável.
          </p>

          <h2 className="text-xl font-bold">9. Contato</h2>
          <p>
            Dúvidas ou pedidos relacionados aos seus dados:{' '}
            <a
              href="mailto:contato@marcapagina.app"
              className="text-primary hover:underline"
            >
              contato@marcapagina.app
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
