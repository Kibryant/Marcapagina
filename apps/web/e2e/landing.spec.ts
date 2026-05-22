import { expect, test } from '@playwright/test';

// Página pública — sem sessão.
test.use({ storageState: { cookies: [], origins: [] } });

test('a landing page carrega para visitantes', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /evolua seu ritmo/i })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /criar conta/i }).first()
  ).toBeVisible();
});
