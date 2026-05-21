---
description: Roda lint, type-check e testes do monorepo e reporta o resultado.
---

Rode a suíte de verificação do projeto, em ordem, e reporte um resumo
conciso (o que passou e o que falhou):

1. **Lint + format** — `npm run lint`
2. **Type-check (web)** — `cd apps/web && npx tsc --noEmit`
3. **Testes** — `npm run test`

Regras:

- Se algo falhar, liste os erros relevantes e proponha a correção.
- Não comite nada nem aplique correções sem o usuário pedir.
- O `apps/mobile` ainda tem pendências de lint conhecidas — sinalize, mas
  não trate como bloqueio a menos que o usuário peça.
- Build de produção (`cd apps/web && npx next build`) é opcional; rode só
  se o usuário pedir ou se as mudanças mexerem em rotas/config.
