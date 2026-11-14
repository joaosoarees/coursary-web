import { aws, table } from './support/aws';
import { readCourse } from './support/run';
import { expect, signInAs, test } from './support/test';

test('arquiva o curso, o aluno é avisado, e o curso é apagado', async ({
  page,
  browser,
}) => {
  const course = readCourse();
  const studentContext = await browser.newContext();

  try {
    await signInAs(studentContext, 'aluno');
    const studentPage = await studentContext.newPage();
    await studentPage.goto('/minhas-matriculas');
    await expect(
      studentPage.getByRole('button', { name: 'Notificações', exact: true }),
    ).toBeVisible();

    await page.goto(`/instrutor/cursos/${course.id}`);
    await page.getByRole('button', { name: 'Arquivar' }).click();
    await page
      .getByRole('alertdialog', { name: 'Arquivar o curso?' })
      .getByRole('button', { name: 'Arquivar o curso' })
      .click();
    await expect(page.getByText('Curso arquivado.')).toBeVisible();

    // No reload on the student's page: only the socket can bring the notice.
    await studentPage
      .getByRole('button', { name: 'Notificações, 1 não lida' })
      .click({ timeout: 30_000 });
    await expect(
      studentPage
        .getByRole('region', { name: 'Notificações' })
        .getByRole('link', { name: `${course.title} foi arquivado` }),
    ).toBeVisible();
  } finally {
    await studentContext.close();
  }

  // The API refuses the delete for an hour after archiving: the date moves back past it.
  aws(
    'dynamodb',
    'update-item',
    '--table-name',
    table,
    '--key',
    JSON.stringify({
      PK: { S: `COURSE#${course.id}` },
      SK: { S: `COURSE#${course.id}` },
    }),
    '--update-expression',
    'SET archivedAt = :archivedAt',
    '--expression-attribute-values',
    JSON.stringify({
      ':archivedAt': { S: new Date(Date.now() - 61 * 60_000).toISOString() },
    }),
  );

  await page.getByRole('button', { name: 'Apagar curso' }).click();
  await page
    .getByRole('alertdialog', { name: 'Apagar o curso?' })
    .getByRole('button', { name: 'Apagar curso' })
    .click();

  await expect(page.getByText('Curso apagado.')).toBeVisible();
  await expect(page).toHaveURL(/\/instrutor\/cursos$/);
  // The instructor of the run had this course only.
  await expect(
    page.getByText('Você ainda não criou nenhum curso'),
  ).toBeVisible();
});
