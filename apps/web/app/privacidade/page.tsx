import { BookOpen, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade · Marcapágina',
  description:
    'O que coletamos, por que, e como você controla seus dados no Marcapágina.',
};

export default function PrivacidadePage() {
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

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-black tracking-tight">
          Política de Privacidade
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="space-y-4 mt-8 text-sm leading-relaxed">
          <h2 className="text-xl font-bold">1. Resumo honesto</h2>
          <p>
            Coletamos o mínimo possível pra fazer o serviço funcionar: email +
            senha (criptografada) pra você logar, e os dados de leitura que você
            mesmo registra (livros, sessões, trechos, metas). Nada disso é
            vendido, alugado ou compartilhado pra propaganda.
          </p>

          <h2 className="text-xl font-bold">2. Base legal (LGPD)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Execução de contrato:</strong> processar email/senha pra
              te autenticar e seus livros pra exibir suas estatísticas.
            </li>
            <li>
              <strong>Legítimo interesse:</strong> logs operacionais e de
              segurança (ex.: tentativas de login, erros) por período limitado.
            </li>
            <li>
              <strong>Consentimento:</strong> tornar perfil ou trechos públicos
              é opt-in explícito nas configurações.
            </li>
          </ul>

          <h2 className="text-xl font-bold">3. O que coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Conta:</strong> email, nome de exibição, foto opcional,
              fuso horário.
            </li>
            <li>
              <strong>Leitura:</strong> livros que você adiciona, páginas,
              tempo, notas, citações, metas.
            </li>
            <li>
              <strong>Uso:</strong> timestamps de sessões, horário das leituras,
              dias ativos.
            </li>
            <li>
              <strong>Diagnóstico:</strong> erros do app via Sentry (somente se
              ativado em produção, com IP truncado).
            </li>
          </ul>

          <h2 className="text-xl font-bold">4. O que não coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Não usamos Google Analytics nem trackers de propaganda.</li>
            <li>Não vendemos seus dados para terceiros.</li>
            <li>Não compartilhamos sua leitura com seus contatos.</li>
          </ul>

          <h2 className="text-xl font-bold">5. Quem processa seus dados</h2>
          <p>
            Usamos provedores de infraestrutura conhecidos, todos com obrigações
            contratuais de proteção:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Supabase</strong> (banco Postgres + autenticação) — dados
              em região configurada.
            </li>
            <li>
              <strong>Vercel</strong> (hospedagem da aplicação).
            </li>
            <li>
              <strong>Google Books / Open Library</strong> — usados só quando
              você busca um livro pra adicionar. Não enviamos sua identidade pra
              eles.
            </li>
            <li>
              <strong>Sentry</strong> (opcional, monitoramento de erros).
            </li>
          </ul>

          <h2 className="text-xl font-bold">6. Seus direitos</h2>
          <p>Pela LGPD, você pode pedir a qualquer momento:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acesso aos seus dados (export em CSV/JSON).</li>
            <li>Correção de dados imprecisos.</li>
            <li>Exclusão da sua conta e dados associados.</li>
            <li>Portabilidade pra outro serviço.</li>
            <li>Saber com quem compartilhamos (resposta: lista acima).</li>
          </ul>
          <p>
            Mande email pra{' '}
            <a
              href="mailto:contato@marcapagina.app"
              className="text-primary hover:underline"
            >
              contato@marcapagina.app
            </a>{' '}
            e respondemos em até 15 dias.
          </p>

          <h2 className="text-xl font-bold">7. Segurança</h2>
          <p>
            Senhas usam hash via Supabase Auth. O banco aplica Row Level
            Security — sua leitura é tecnicamente inacessível pra outros
            usuários. Comunicação client–servidor sempre via HTTPS.
          </p>

          <h2 className="text-xl font-bold">8. Cookies</h2>
          <p>
            Usamos cookies essenciais pra manter você logado e lembrar do seu
            tema (claro/escuro). Não usamos cookies de rastreamento.
          </p>

          <h2 className="text-xl font-bold">9. Crianças</h2>
          <p>
            O serviço não é destinado a menores de 13 anos. Se descobrirmos que
            coletamos dados de menores sem consentimento dos responsáveis,
            removemos imediatamente.
          </p>

          <h2 className="text-xl font-bold">10. Mudanças nesta política</h2>
          <p>
            Mudanças relevantes são comunicadas no app ou por email com
            antecedência razoável.
          </p>
        </section>
      </main>
    </div>
  );
}
