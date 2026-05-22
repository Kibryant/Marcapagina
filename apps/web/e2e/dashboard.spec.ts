import { expect, test } from '@playwright/test';

test('o dashboard mostra a saudação e o livro em leitura', async ({ page }) => {
  await page.goto('/app');

  await expect(
    page.getByRole('heading', { name: /oi, leitor e2e/i })
  ).toBeVisible();

  // O livro semeado está com status "reading" → aparece em "Lendo agora".
  await expect(page.getByText('O Livro de Teste').first()).toBeVisible();
});
