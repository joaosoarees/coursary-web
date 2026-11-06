import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditLessonPage from '~/routes/editar-aula';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { LessonService } from '~/services/LessonService';
import { OutlineService } from '~/services/OutlineService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const course: ManagedCourse = {
  id: 'c1',
  title: 'Gráficos',
  description: '',
  status: 'DRAFT',
  lessonCount: 2,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

beforeEach(() => {
  vi.spyOn(LessonService, 'outline').mockResolvedValue({
    courseId: 'c1',
    title: 'Gráficos',
    status: 'DRAFT',
    modules: [
      {
        id: 'm1',
        title: 'Escolhendo',
        position: 0,
        lessons: [
          { id: 'l1', title: 'O que mostrar', durationMinutes: 9, position: 0 },
          {
            id: 'l2',
            title: 'Barras ou linhas?',
            durationMinutes: 12,
            position: 1,
          },
        ],
      },
    ],
  });
  vi.spyOn(LessonService, 'open').mockResolvedValue({
    lessonId: 'l2',
    courseId: 'c1',
    body: '## A pergunta',
    attachments: [],
  });
});

const renderAt = (lessonId = 'l2') =>
  renderRoutes(
    [
      {
        path: '/instrutor/cursos/:id/aulas/:aulaId',
        Component: EditLessonPage,
      },
      {
        path: '/instrutor/cursos/:id',
        Component: () => <Landing title="Editar curso" />,
      },
    ],
    `/instrutor/cursos/c1/aulas/${lessonId}`,
  );

describe('edit lesson', () => {
  it('should show where the lesson is and save its changes', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
    const update = vi.spyOn(OutlineService, 'updateLesson').mockResolvedValue({
      id: 'l2',
      moduleId: 'm1',
      title: 'Barras, linhas ou nada?',
      body: '## A pergunta',
      durationMinutes: 15,
      position: 1,
    });
    renderAt();

    expect(await screen.findByText('Módulo 1 · Aula 2')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Barras ou linhas?' }),
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Texto da aula (opcional)' }),
    ).toHaveValue('## A pergunta');

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Barras, linhas ou nada?' },
    });
    fireEvent.change(screen.getByLabelText('Duração'), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Barras, linhas ou nada?',
      }),
    ).toBeVisible();
    expect(update).toHaveBeenCalledWith('c1', 'm1', 'l2', {
      title: 'Barras, linhas ou nada?',
      durationMinutes: 15,
      body: '## A pergunta',
    });
  });

  it('should save with Ctrl+S from the text', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
    const update = vi
      .spyOn(OutlineService, 'updateLesson')
      .mockImplementation(() => new Promise(() => undefined));
    renderAt();

    const text = await screen.findByRole('textbox', {
      name: 'Texto da aula (opcional)',
    });
    fireEvent.change(text, { target: { value: '## Outra pergunta' } });
    fireEvent.keyDown(text, { key: 's', ctrlKey: true });

    await waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });

  it('should refuse a body over 32 KiB counted in bytes', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
    const update = vi.spyOn(OutlineService, 'updateLesson');
    renderAt();

    fireEvent.change(
      await screen.findByRole('textbox', {
        name: 'Texto da aula (opcional)',
      }),
      {
        target: { value: 'é'.repeat(16 * 1024 + 1) },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText(/O texto passou de 32 KiB/)).toBeVisible();
    expect(update).not.toHaveBeenCalled();
  });

  it('should ask before leaving with unsaved changes', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
    renderAt();

    fireEvent.change(await screen.findByLabelText('Título'), {
      target: { value: 'Mudado' },
    });
    const back = screen.getByRole('link', { name: 'Gráficos' });
    back.focus();
    fireEvent.click(back);

    expect(
      await screen.findByRole('dialog', { name: 'Sair sem salvar?' }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));

    await waitFor(() => {
      expect(back).toHaveFocus();
    });
  });

  it('should show an archived course lesson read-only', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...course,
      status: 'ARCHIVED',
    });
    renderAt();

    expect(await screen.findByLabelText('Título')).toHaveAttribute('readonly');
    expect(screen.getByRole('note')).toHaveTextContent(
      'não pode mais ser editada',
    );
    expect(
      screen.queryByRole('button', { name: 'Salvar alterações' }),
    ).toBeNull();
  });

  it('should say a lesson that is not in the course is not found', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
    vi.spyOn(LessonService, 'open').mockRejectedValue(
      apiError(404, 'LESSON_NOT_FOUND'),
    );
    renderAt('l9');

    expect(
      await screen.findByRole('heading', { name: 'Aula não encontrada' }),
    ).toBeVisible();
  });
});
