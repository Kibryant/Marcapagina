import { expect, test as setup } from '@playwright/test';

// Faz login com o usuário semeado (supabase/seed.sql) e salva o estado de
// sessão. Os specs autenticados reaproveitam esse storageState.
const authFile = 'e2e/.auth/user.json';

setup('autentica o usuário de teste', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill('e2e@marcapagina.test');
  await page.locator('#password').fill('e2e-password-123');
  await page.getByRole('button', { name: /entrar no sistema/i }).click();

  // Login bem-sucedido redireciona para o dashboard.
  await page.waitForURL('**/app');
  await expect(
    page.getByRole('heading', { name: /oi, leitor e2e/i })
  ).toBeVisible();

  await page.context().storageState({ path: authFile });
});
