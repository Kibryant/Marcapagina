import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('definir metas manualmente exibe o card de progresso', async ({
  page,
}) => {
  await page.goto('/app/goals');

  await expect(
    page.getByRole('heading', { name: /suas metas/i })
  ).toBeVisible();

  // Formulário manual: define valores específicos para o teste.
  const dailyInput = page.getByLabel(/meta diária/i);
  const monthlyInput = page.getByLabel(/meta mensal/i);

  await dailyInput.fill('17');
  await monthlyInput.fill('513');

  await page.getByRole('button', { name: /salvar metas/i }).click();

  // Toast de sucesso confirma o save.
  await expect(page.getByText(/metas salvas/i).first()).toBeVisible();

  // Após o refresh, o card "Meta Diária" deve mostrar o valor 17.
  const dailyCard = page
    .locator('div', { has: page.getByText(/meta diária/i) })
    .filter({ hasText: '/ 17' })
    .first();
  await expect(dailyCard).toBeVisible();

  const monthlyCard = page
    .locator('div', { has: page.getByText(/meta mensal/i) })
    .filter({ hasText: '/ 513' })
    .first();
  await expect(monthlyCard).toBeVisible();
});
