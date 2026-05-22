import { expect, test } from '@playwright/test';

test('a biblioteca lista o livro semeado', async ({ page }) => {
  await page.goto('/app/books');

  await expect(
    page.getByRole('heading', { name: /minha biblioteca/i })
  ).toBeVisible();
  await expect(page.getByText('O Livro de Teste').first()).toBeVisible();
});
