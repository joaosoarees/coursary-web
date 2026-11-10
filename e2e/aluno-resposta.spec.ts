import { readCourse, readLessonId, readState } from './support/run';
import { expect, test } from './support/test';

test('lê a resposta do instrutor', async ({ page }) => {
  const { accounts } = readState();

  await page.goto(`/cursos/${readCourse().id}/aulas/${readLessonId()}`);
  const question = page.getByRole('listitem').filter({
    has: page.getByRole('article', {
      name: `Pergunta de ${accounts.aluno.name}`,
    }),
  });
  await question.getByRole('button', { name: /1 resposta/ }).click();

  const answer = question.getByRole('listitem').filter({
    hasText: 'Vale, sim: é o mesmo conjunto de dados.',
  });
  await expect(answer).toContainText(accounts.instrutor.name);
  await expect(answer.getByText('Instrutor', { exact: true })).toBeVisible();
});
