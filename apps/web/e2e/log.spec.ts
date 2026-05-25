import { expect, test } from '@playwright/test';

// Os testes que escrevem no banco rodam em série dentro do arquivo para evitar
// disputa entre páginas/sessões do mesmo usuário semeado.
test.describe.configure({ mode: 'serial' });

test('registrar uma leitura mostra toast e retorna ao dashboard', async ({
  page,
}) => {
  await page.goto('/app/log');

  await expect(
    page.getByRole('heading', { name: /registrar leitura/i })
  ).toBeVisible();

  // O livro semeado está em leitura → deve aparecer pré-selecionado.
  await expect(page.getByText('O Livro de Teste').first()).toBeVisible();

  // Incrementa as páginas lidas para 3 (1 → 3).
  const plusBtn = page
    .getByRole('button')
    .filter({ has: page.locator('svg.lucide-plus') });
  await plusBtn.first().click();
  await plusBtn.first().click();

  // Define uma duração curta para o cálculo de XP.
  await page.getByLabel(/duração/i).fill('5');

  await page.getByRole('button', { name: /finalizar registro/i }).click();

  // Toast de sucesso aparece em algum lugar da tela.
  await expect(page.getByText(/leitura registrada!/i).first()).toBeVisible();

  // E somos redirecionados ao dashboard.
  await page.waitForURL('**/app');
  await expect(
    page.getByRole('heading', { name: /oi, leitor e2e/i })
  ).toBeVisible();
});

test('o livro selecionado avança após registrar leitura', async ({ page }) => {
  await page.goto('/app/log');

  // Captura o current_page exibido (formato: "pág X de Y").
  const bookRow = page
    .locator('button', { hasText: 'O Livro de Teste' })
    .first();
  const beforeText = await bookRow.innerText();
  const match = beforeText.match(/pág\s+(\d+)\s+de\s+(\d+)/i);
  expect(match).not.toBeNull();
  const before = Number(match?.[1]);

  // Registra 1 página com 0 minutos.
  await page.getByRole('button', { name: /finalizar registro/i }).click();
  await page.waitForURL('**/app');

  // Volta ao log e confirma que current_page subiu em 1.
  await page.goto('/app/log');
  const afterText = await page
    .locator('button', { hasText: 'O Livro de Teste' })
    .first()
    .innerText();
  const afterMatch = afterText.match(/pág\s+(\d+)\s+de\s+(\d+)/i);
  const after = Number(afterMatch?.[1]);
  expect(after).toBe(before + 1);
});
