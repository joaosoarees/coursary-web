import { readFile } from 'node:fs/promises';

import { readCourse, readLessonId, readState } from './support/run';
import { expect, signInAs, test } from './support/test';

test('vê o aluno na lista e baixa o CSV', async ({ page }) => {
  const student = readState().accounts.aluno;

  await page.goto(`/instrutor/cursos/${readCourse().id}/alunos`);
  const list = page.getByRole('region', { name: 'Lista de alunos' });
  await expect(list.getByText(student.name)).toBeVisible();

  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const link = page.getByRole('link', { name: 'Baixar CSV' });
  await expect(link).toBeVisible({ timeout: 60_000 });

  const download = page.waitForEvent('download');
  await link.click();
  const csv = await readFile(await (await download).path(), 'utf8');
  expect(csv).toContain(student.name);
});

test('responde a pergunta pela prévia da aula, e o aluno a vê chegar', async ({
  page,
  browser,
}) => {
  const studentContext = await browser.newContext();
  const student = await signInAs(studentContext, 'aluno');
  const studentPage = await studentContext.newPage();
  await studentPage.goto(`/cursos/${readCourse().id}/aulas/${readLessonId()}`);
  const asked = studentPage.getByRole('listitem').filter({
    has: studentPage.getByRole('article', {
      name: `Pergunta de ${student.name}`,
    }),
  });
  await expect(asked.getByRole('button', { name: 'Responder' })).toBeVisible();

  await page.goto(
    `/instrutor/cursos/${readCourse().id}/aulas/${readLessonId()}/previa`,
  );
  const question = page.getByRole('listitem').filter({
    has: page.getByRole('article', { name: `Pergunta de ${student.name}` }),
  });
  await question.getByRole('button', { name: 'Responder' }).click();
  await expect(question.getByLabel('Sua resposta')).toBeFocused();
  await page.keyboard.type('Vale, sim: é o mesmo conjunto de dados.');
  await page.keyboard.press('Control+Enter');

  await expect(page.getByText('Resposta enviada.')).toBeVisible();
  await expect(question.getByText('Instrutor', { exact: true })).toBeVisible();

  // No reload on the student's page: only the socket can bring the count.
  await expect(asked.getByRole('button', { name: '1 resposta' })).toBeVisible({
    timeout: 15_000,
  });
  await studentContext.close();
});
