import { readState } from './support/run';
import { expect, test } from './support/test';

test('chega à resposta do instrutor pelo sino', async ({ page }) => {
  const { accounts } = readState();

  await page.goto('/minhas-matriculas');
  await page.getByRole('button', { name: 'Notificações, 1 não lida' }).click();
  await page
    .getByRole('region', { name: 'Notificações' })
    .getByRole('link', {
      name: new RegExp(`${accounts.instrutor.name} respondeu à sua pergunta`),
    })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Perguntas', exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Notificações', exact: true }),
  ).toBeVisible();

  const question = page.getByRole('listitem').filter({
    has: page.getByRole('article', {
      name: `Pergunta de ${accounts.aluno.name}`,
    }),
  });
  await question
    .getByRole('button', { name: '1 resposta', exact: true })
    .click();

  const answer = question.getByRole('listitem').filter({
    hasText: 'Vale, sim: é o mesmo conjunto de dados.',
  });
  await expect(answer).toContainText(accounts.instrutor.name);
  await expect(answer.getByText('Instrutor', { exact: true })).toBeVisible();
});
