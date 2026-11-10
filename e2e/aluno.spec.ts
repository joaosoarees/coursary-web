import {
  LESSON_TITLE,
  readCourse,
  readState,
  updateState,
} from './support/run';
import { waitForIndex } from './support/searchIndex';
import { expect, test } from './support/test';

test.describe.configure({ mode: 'serial' });

test('acha o curso na busca', async ({ page }) => {
  const { id, title } = readCourse();
  await waitForIndex(id);

  await page.goto('/cursos');
  await page.getByLabel('Buscar cursos').fill(title);
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(
    page.getByRole('heading', { name: `Resultados para “${title}”` }),
  ).toBeVisible();

  await page.getByRole('link', { name: title }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('matricula, conclui a aula e avalia o curso', async ({ page }) => {
  const { id } = readCourse();

  await page.goto(`/cursos/${id}`);
  await page.getByRole('button', { name: 'Matricular-me' }).click();
  await expect(page.getByText('Você está matriculado')).toBeVisible();

  await page.getByRole('link', { name: new RegExp(LESSON_TITLE) }).click();
  await expect(page.getByRole('heading', { name: LESSON_TITLE })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Baixar material.pdf' }),
  ).toBeVisible();

  // The box is drawn over a visually hidden input: a person clicks its label.
  await page.getByText('Marcar concluída', { exact: true }).click();
  await expect(page.getByRole('status').getByText('Concluída')).toBeVisible();

  // The last lesson of the course suggests the review.
  const review = page.getByRole('dialog', { name: 'Você concluiu o curso' });
  // The star drawn over the hidden radio takes the click, as on the box above.
  const fiveStars = review.getByRole('radio', { name: '5 estrelas' });
  await fiveStars.locator('..').click();
  await expect(fiveStars).toBeChecked();
  await review
    .getByLabel('Comentário (opcional)')
    .fill('Curto e direto, como a jornada.');
  await review.getByRole('button', { name: 'Enviar avaliação' }).click();
  await expect(page.getByText('Avaliação salva.')).toBeVisible();
});

test('vê o curso concluído em minhas matrículas', async ({ page }) => {
  await page.goto('/minhas-matriculas');

  await expect(
    page.getByRole('link', { name: new RegExp(readCourse().title) }),
  ).toContainText('Concluído');
});

test('pergunta sobre a aula', async ({ page }) => {
  const course = readCourse();
  const student = readState().accounts.aluno;

  await page.goto(`/cursos/${course.id}`);
  await page
    .getByRole('link', { name: new RegExp(LESSON_TITLE) })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: LESSON_TITLE })).toBeVisible();
  const lessonId = /\/aulas\/([^/]+)/.exec(new URL(page.url()).pathname)?.[1];
  if (!lessonId) {
    throw new Error(`No lesson id in ${page.url()}.`);
  }
  updateState({ course: { ...course, lessonId } });

  await page
    .getByLabel('Faça uma pergunta sobre esta aula')
    .fill('O material vale para a próxima aula também?');
  await page.getByRole('button', { name: 'Perguntar' }).click();

  await expect(page.getByText('Pergunta enviada.')).toBeVisible();
  await expect(
    page.getByRole('article', { name: `Pergunta de ${student.name}` }),
  ).toContainText('O material vale para a próxima aula também?');
});
