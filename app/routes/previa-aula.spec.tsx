import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LessonPreviewRoute from '~/routes/previa-aula';
import { EnrollmentService } from '~/services/EnrollmentService';
import {
  type CourseOutline,
  type LessonContent,
  LessonService,
} from '~/services/LessonService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const outline: CourseOutline = {
  courseId: 'c1',
  title: 'Python para análise de dados',
  status: 'DRAFT',
  modules: [
    {
      id: 'm1',
      title: 'Pandas na prática',
      position: 0,
      lessons: [
        { id: 'l1', title: 'Filtrando', durationMinutes: 16, position: 0 },
        { id: 'l2', title: 'Juntando', durationMinutes: 13, position: 1 },
      ],
    },
  ],
};

const content: LessonContent = {
  lessonId: 'l1',
  courseId: 'c1',
  body: '## O que você vai usar',
  attachments: [],
};

let progress: ReturnType<typeof vi.spyOn>;
let savePosition: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.spyOn(LessonService, 'outline').mockResolvedValue(outline);
  vi.spyOn(LessonService, 'open').mockResolvedValue(content);
  progress = vi.spyOn(EnrollmentService, 'progress');
  savePosition = vi.spyOn(EnrollmentService, 'savePosition');
});

const renderPreview = (lessonId = 'l1') =>
  renderRoutes(
    [
      {
        path: '/instrutor/cursos/:id/aulas/:aulaId/previa',
        Component: LessonPreviewRoute,
      },
    ],
    `/instrutor/cursos/c1/aulas/${lessonId}/previa`,
  );

describe('the lesson preview', () => {
  it('should show the lesson as a student would, with nothing to mark or review', async () => {
    renderPreview();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Filtrando' }),
    ).toBeVisible();
    expect(screen.getByRole('note')).toHaveTextContent(
      'Prévia: é assim que o aluno vê esta aula.',
    );
    expect(screen.queryByText('Marcar concluída')).toBeNull();
    expect(screen.queryByRole('button', { name: /Avaliar/ })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Próxima aula: Juntando' }),
    ).toHaveAttribute('href', '/instrutor/cursos/c1/aulas/l2/previa');
    expect(progress).not.toHaveBeenCalled();
    expect(savePosition).not.toHaveBeenCalled();
  });

  it('should move to the next lesson inside the preview', async () => {
    vi.spyOn(LessonService, 'open').mockResolvedValue({
      ...content,
      lessonId: 'l2',
    });
    renderPreview();

    fireEvent.click(
      await screen.findByRole('link', { name: 'Próxima aula: Juntando' }),
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Juntando' }),
    ).toBeVisible();
  });

  it('should say a lesson that is not in one of your courses is not found', async () => {
    vi.spyOn(LessonService, 'open').mockRejectedValue(
      apiError(403, 'FORBIDDEN'),
    );
    renderPreview();

    expect(
      await screen.findByRole('heading', { name: 'Aula não encontrada' }),
    ).toBeVisible();
  });
});
