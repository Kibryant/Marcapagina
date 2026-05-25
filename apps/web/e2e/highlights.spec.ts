import { expect, test } from '@playwright/test';

// Os testes escrevem no banco e devem rodar em série para não brigarem
// entre si pela mesma linha em public.highlights.
test.describe.configure({ mode: 'serial' });

const BOOK_ID = '22222222-2222-2222-2222-222222222222';

test('cria um trecho no detalhe do livro e ele aparece em /app/highlights', async ({
  page,
}) => {
  await page.goto(`/app/books/${BOOK_ID}`);

  // Painel lateral "Trechos & Notas".
  await expect(
    page.getByRole('heading', { name: /trechos & notas/i })
  ).toBeVisible();

  const textarea = page.getByPlaceholder(/anote algo que voc[êe] gostou/i);
  await textarea.fill('Citação criada pelo teste E2E');
  await page.getByLabel(/^p[áa]gina$/i).fill('77');
  await page.getByRole('button', { name: /^salvar$/i }).click();

  // Toast de sucesso.
  await expect(page.getByText(/trecho salvo/i).first()).toBeVisible();

  // Vai pra página global e confirma que o trecho aparece com o livro certo.
  await page.goto('/app/highlights');
  await expect(
    page.getByRole('heading', { name: /cita[çc][õo]es/i })
  ).toBeVisible();
  await expect(
    page.getByText('Citação criada pelo teste E2E').first()
  ).toBeVisible();
  await expect(page.getByText('Página 77').first()).toBeVisible();
});

test('busca em /app/highlights filtra pelos trechos visíveis', async ({
  page,
}) => {
  // Adiciona um segundo trecho para validar o filtro.
  await page.goto(`/app/books/${BOOK_ID}`);
  await page
    .getByPlaceholder(/anote algo que voc[êe] gostou/i)
    .fill('Outro pensamento completamente diferente');
  await page.getByRole('button', { name: /^salvar$/i }).click();
  await expect(page.getByText(/trecho salvo/i).first()).toBeVisible();

  await page.goto('/app/highlights');

  const search = page.getByPlaceholder(/buscar por trecho/i);
  await search.fill('completamente diferente');

  await expect(
    page.getByText('Outro pensamento completamente diferente').first()
  ).toBeVisible();
  await expect(page.getByText('Citação criada pelo teste E2E')).toHaveCount(0);
});

test('excluir um trecho remove ele da página', async ({ page }) => {
  await page.goto('/app/highlights');

  const card = page
    .locator('article', { hasText: 'Citação criada pelo teste E2E' })
    .first();
  await card.hover();
  await card.getByTitle('Excluir').click();

  await page.getByRole('button', { name: /^excluir$/i }).click();

  await expect(page.getByText(/trecho exclu[íi]do/i).first()).toBeVisible();
  await expect(page.getByText('Citação criada pelo teste E2E')).toHaveCount(0);
});
