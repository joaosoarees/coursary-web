import { readState } from './support/run';
import { expect, test } from './support/test';

test('muda o papel da conta, desativa e reativa', async ({ page }) => {
  const { name, email } = readState().accounts.alvo;

  await page.goto('/admin/usuarios');
  await page.getByLabel('Buscar por e-mail').fill(email);
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name }).click();

  const panel = page.getByRole('dialog', { name });
  await panel.getByRole('combobox', { name: 'Novo papel' }).click();
  await page.getByRole('option', { name: 'Instrutor' }).click();
  await panel.getByRole('button', { name: 'Salvar papel' }).click();
  await page
    .getByRole('alertdialog', { name: `Tornar ${name} instrutor?` })
    .getByRole('button', { name: 'Tornar instrutor' })
    .click();
  await expect(page.getByText(`${name} agora é instrutor.`)).toBeVisible();
  await expect(panel.getByText('Aluno → Instrutor')).toBeVisible();
  await expect(panel.getByText(/por você/)).toBeVisible();

  await panel.getByRole('button', { name: 'Desativar conta' }).click();
  await page
    .getByRole('alertdialog', { name: `Desativar a conta de ${name}?` })
    .getByRole('button', { name: 'Desativar conta' })
    .click();
  await expect(
    page.getByText(`A conta de ${name} foi desativada.`),
  ).toBeVisible();

  await panel.getByRole('button', { name: 'Reativar conta' }).click();
  await page
    .getByRole('alertdialog', { name: `Reativar a conta de ${name}?` })
    .getByRole('button', { name: 'Reativar conta' })
    .click();
  await expect(
    page.getByText(`A conta de ${name} foi reativada.`),
  ).toBeVisible();
});
