import { expect, test } from '@playwright/test';

test('a página de conquistas lista as conquistas semeadas', async ({
  page,
}) => {
  await page.goto('/app/achievements');

  await expect(
    page.getByRole('heading', { name: /conquistas/i })
  ).toBeVisible();

  // As conquistas semeadas em supabase/seed.sql devem aparecer.
  await expect(page.getByText('Maratonista E2E')).toBeVisible();
  await expect(page.getByText('Colecionador E2E')).toBeVisible();

  // Como ambas têm criteria_value=999, nenhuma deve estar desbloqueada na
  // primeira sessão de teste. O bloco de progresso mostra "0%".
  await expect(page.getByText('0%')).toBeVisible();
});
