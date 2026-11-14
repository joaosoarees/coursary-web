import { readFile } from 'node:fs/promises';

import {
  LESSON_TITLE,
  readCourse,
  readLessonId,
  readState,
} from './support/run';
import { expect, signInAs, test } from './support/test';

test('vê o aluno na lista e baixa o CSV pelo aviso', async ({ page }) => {
  const student = readState().accounts.aluno;
  const course = readCourse();

  await page.goto(`/instrutor/cursos/${course.id}/alunos`);
  const list = page.getByRole('region', { name: 'Lista de alunos' });
  await expect(list.getByText(student.name)).toBeVisible();

  const requested = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/courses/${course.id}/exports`),
  );
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  expect((await requested).ok()).toBe(true);
  await page.goto('/instrutor/cursos');

  // The student's question is the first unread; the CSV notice arrives over the socket.
  await page
    .getByRole('button', { name: 'Notificações, 2 não lidas' })
    .click({ timeout: 60_000 });
  await page
    .getByRole('region', { name: 'Notificações' })
    .getByRole('link', {
      name: `O CSV dos alunos de ${course.title} está pronto`,
    })
    .click();

  const link = page.getByRole('link', { name: 'Baixar CSV' });
  await expect(link).toBeVisible();

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

  try {
    const student = await signInAs(studentContext, 'aluno');
    const studentPage = await studentContext.newPage();
    await studentPage.goto(
      `/cursos/${readCourse().id}/aulas/${readLessonId()}`,
    );
    const asked = studentPage.getByRole('listitem').filter({
      has: studentPage.getByRole('article', {
        name: `Pergunta de ${student.name}`,
      }),
    });
    await expect(
      asked.getByRole('button', { name: 'Responder' }),
    ).toBeVisible();

    await page.goto('/instrutor/cursos');
    await page
      .getByRole('button', { name: 'Notificações, 1 não lida' })
      .click();
    await page
      .getByRole('region', { name: 'Notificações' })
      .getByRole('link', {
        name: `${student.name} perguntou em ${LESSON_TITLE} (${readCourse().title})`,
      })
      .click();
    const question = page.getByRole('listitem').filter({
      has: page.getByRole('article', { name: `Pergunta de ${student.name}` }),
    });
    await question.getByRole('button', { name: 'Responder' }).click();
    await expect(question.getByLabel('Sua resposta')).toBeFocused();
    await page.keyboard.type('Vale, sim: é o mesmo conjunto de dados.');
    await page.keyboard.press('Control+Enter');

    await expect(page.getByText('Resposta enviada.')).toBeVisible();
    await expect(
      question.getByText('Instrutor', { exact: true }),
    ).toBeVisible();

    // No reload on the student's page: only the socket can bring the count and the bell.
    await expect(asked.getByRole('button', { name: '1 resposta' })).toBeVisible(
      {
        timeout: 15_000,
      },
    );
    await expect(
      studentPage.getByRole('button', { name: 'Notificações, 1 não lida' }),
    ).toBeVisible({ timeout: 15_000 });
  } finally {
    await studentContext.close();
  }
});
