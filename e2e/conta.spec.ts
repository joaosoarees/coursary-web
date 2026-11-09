import { randomBytes } from 'node:crypto';

import { chooseFiles, fixture } from './support/files';
import { readState, updateState } from './support/run';
import { expect, test } from './support/test';

test.describe.configure({ mode: 'serial' });

// The sign-up stops at the code sent by e-mail; the pending account expires on its own.
test('cadastro leva à confirmação do e-mail', async ({ page }) => {
  await page.goto('/cadastro');
  await page.getByLabel('Nome').fill('Cadastro E2E');
  await page
    .getByLabel('E-mail')
    .fill(
      `success+e2e-web-${randomBytes(6).toString('hex')}@simulator.amazonses.com`,
    );
  await page
    .getByLabel('Senha', { exact: true })
    .fill(`E2e${randomBytes(9).toString('hex')}1`);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(
    page.getByRole('heading', { name: 'Confirme seu e-mail' }),
  ).toBeVisible();
  await expect(page.getByLabel('Código')).toBeVisible();
});

test('entra, muda o nome e a foto e sai', async ({ page }) => {
  const { accounts } = readState();
  const account = accounts.alvo;
  const name = `${account.name} Editada`;

  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill(account.email);
  await page.getByLabel('Senha', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible();

  await page.getByRole('button', { name: `Conta de ${account.name}` }).click();
  await page.getByRole('menuitem', { name: 'Perfil' }).click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

  await page.getByLabel('Nome').fill(name);
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('Nome salvo.')).toBeVisible();
  updateState({ accounts: { ...accounts, alvo: { ...account, name } } });

  await chooseFiles(page, 'Trocar foto', fixture('avatar.png'));
  await expect(page.getByText('Foto atualizada.')).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('button', { name: `Conta de ${name}` }).click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByText('Você saiu.')).toBeVisible();
});
