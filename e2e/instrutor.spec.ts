import { randomBytes } from 'node:crypto';

import { chooseFiles, fixture } from './support/files';
import {
  LESSON_TITLE,
  readCourse,
  readState,
  updateState,
} from './support/run';
import { expect, test } from './support/test';

test.describe.configure({ mode: 'serial' });

test('cria o curso com capa', async ({ page }) => {
  const title = `Curso E2E ${readState().stamp}`;

  await page.goto('/instrutor/cursos/novo');
  await page.getByLabel('Título').fill(title);
  await page
    .getByLabel('Descrição (opcional)')
    .fill('Um curso criado pela jornada do Playwright.');
  await page.getByRole('button', { name: 'Criar rascunho' }).click();

  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const id = /\/instrutor\/cursos\/([^/]+)$/.exec(page.url())?.[1];
  expect(id).toBeTruthy();
  updateState({ course: { id: id ?? '', title } });

  await chooseFiles(page, 'Enviar capa', fixture('capa.png'));
  await expect(page.getByText('Capa atualizada.')).toBeVisible({
    timeout: 60_000,
  });
});

test('monta a aula com texto, material e vídeo', async ({ page }) => {
  await page.goto(`/instrutor/cursos/${readCourse().id}`);

  await page.getByRole('button', { name: 'Criar o primeiro módulo' }).click();
  await page.getByRole('textbox', { name: 'Título do módulo' }).fill('Começo');
  await page.getByRole('button', { name: 'Criar módulo' }).click();
  await expect(page.getByText('Módulo criado.')).toBeVisible();

  await page.getByRole('button', { name: 'Nova aula' }).click();
  const dialog = page.getByRole('dialog', { name: 'Nova aula' });
  await dialog.getByLabel('Título').fill(LESSON_TITLE);
  await dialog.getByLabel('Duração').fill('5');
  await dialog.getByRole('button', { name: 'Criar aula' }).click();
  await expect(page.getByText('Aula criada.')).toBeVisible();

  await page.getByRole('link', { name: LESSON_TITLE }).click();
  await expect(page.getByRole('heading', { name: LESSON_TITLE })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Texto da aula (opcional)' })
    .fill('Bem-vindo à **primeira aula**.');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByText('Aula salva.')).toBeVisible();

  await chooseFiles(page, 'Enviar arquivo', fixture('material.pdf'));
  await expect(
    page.getByRole('button', { name: 'Baixar material.pdf' }),
  ).toBeVisible({ timeout: 60_000 });

  // The API stores a video without reading it, so random bytes stand in for one.
  await chooseFiles(page, 'Enviar vídeo', {
    name: 'aula.mp4',
    mimeType: 'video/mp4',
    buffer: randomBytes(1024 * 1024),
  });
  await expect(page.getByText('Vídeo enviado.')).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('link', { name: 'Ver como aluno' }).click();
  await expect(page.getByRole('heading', { name: LESSON_TITLE })).toBeVisible();
  await expect(
    page.getByRole('note').filter({ hasText: 'Prévia' }),
  ).toBeVisible();
});

test('publica o curso', async ({ page }) => {
  await page.goto(`/instrutor/cursos/${readCourse().id}`);

  await page.getByRole('button', { name: 'Publicar' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Publicar o curso?' });
  await confirm.getByRole('button', { name: 'Publicar' }).click();

  await expect(page.getByText('Curso publicado.')).toBeVisible();
  await expect(page.getByText('Publicado', { exact: true })).toBeVisible();
});
