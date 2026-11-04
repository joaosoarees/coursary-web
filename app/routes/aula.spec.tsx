import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import LessonRoute from '~/routes/aula';
import { EnrollmentService, type Progress } from '~/services/EnrollmentService';
import {
  type CourseOutline,
  type LessonContent,
  LessonService,
} from '~/services/LessonService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const outline: CourseOutline = {
  courseId: 'c1',
  title: 'Python para análise de dados',
  status: 'PUBLISHED',
  modules: [
    {
      id: 'm1',
      title: 'Primeiros passos',
      position: 0,
      lessons: [
        { id: 'l1', title: 'Instalando', durationMinutes: 12, position: 0 },
      ],
    },
    {
      id: 'm2',
      title: 'Pandas na prática',
      position: 1,
      lessons: [
        { id: 'l2', title: 'Filtrando', durationMinutes: 16, position: 0 },
        { id: 'l3', title: 'Juntando', durationMinutes: 13, position: 1 },
      ],
    },
  ],
};

const progress: Progress = {
  completedLessons: 1,
  completedLessonIds: ['l1'],
  lastLessonId: 'l2',
  positionSeconds: 252,
};

const content: LessonContent = {
  lessonId: 'l2',
  courseId: 'c1',
  body: '## O que você vai usar\n\nUse `df.query()`.',
  attachments: [
    { id: 'f1', name: 'guia.pdf', contentType: 'application/pdf', size: 2048 },
  ],
  video: { url: 'https://files.test/v.mp4', expiresIn: 7200 },
};

beforeEach(() => {
  vi.spyOn(LessonService, 'outline').mockResolvedValue(outline);
  vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(progress);
  vi.spyOn(LessonService, 'open').mockResolvedValue(content);
});

const renderLesson = (path = '/cursos/c1/aulas/l2') =>
  renderRoutes(
    [
      { path: '/cursos/:id/aulas/:aulaId', Component: LessonRoute },
      { path: '/cursos/:id', Component: () => <Landing title="Curso" /> },
    ],
    path,
  );

describe('the lesson page', () => {
  it('should show the lesson with its video, text, material and the outline', async () => {
    const open = vi.spyOn(LessonService, 'open').mockResolvedValue(content);
    renderLesson();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Filtrando' }),
    ).toBeVisible();
    expect(
      screen.getByText('Módulo 2 · Pandas na prática · Aula 2 de 3 · 16 min'),
    ).toBeVisible();
    expect(screen.getByLabelText('Vídeo da aula Filtrando')).toHaveAttribute(
      'src',
      'https://files.test/v.mp4',
    );
    expect(
      screen.getByRole('heading', { name: 'O que você vai usar' }),
    ).toBeVisible();
    expect(screen.getByText('guia.pdf')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Filtrando/, current: 'page' }),
    ).toBeInTheDocument();
    expect(open).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l2' },
      expect.any(AbortSignal),
    );
  });

  it('should lead to the lessons before and after from the strip under the video', async () => {
    renderLesson();

    const links = within(
      await screen.findByRole('navigation', { name: 'Aulas' }),
    );
    expect(
      links.getByRole('link', { name: 'Aula anterior: Instalando' }),
    ).toHaveAttribute('href', '/cursos/c1/aulas/l1');
    expect(
      links.getByRole('link', { name: 'Próxima aula: Juntando' }),
    ).toHaveAttribute('href', '/cursos/c1/aulas/l3');
  });

  it('should complete the lesson from the checkbox and show it done', async () => {
    const completeLesson = vi
      .spyOn(EnrollmentService, 'completeLesson')
      .mockResolvedValue({
        lessonId: 'l2',
        completedLessons: 2,
        created: true,
      });
    renderLesson();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Marcar concluída' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent('Concluída');
    expect(completeLesson).toHaveBeenCalledWith({
      courseId: 'c1',
      lessonId: 'l2',
    });
    expect(
      screen.getByRole('link', { name: /Filtrando/, current: 'page' }),
    ).toBeInTheDocument();
  });

  it('should complete the lesson when the video ends', async () => {
    const completeLesson = vi
      .spyOn(EnrollmentService, 'completeLesson')
      .mockResolvedValue({
        lessonId: 'l2',
        completedLessons: 2,
        created: true,
      });
    renderLesson();

    fireEvent.ended(await screen.findByLabelText('Vídeo da aula Filtrando'));

    await waitFor(() => {
      expect(completeLesson).toHaveBeenCalledTimes(1);
    });
  });

  it('should say so and keep the box when the completion fails', async () => {
    vi.spyOn(EnrollmentService, 'completeLesson').mockRejectedValue(
      apiError(500, 'INTERNAL'),
    );
    const error = vi.spyOn(toast, 'error');
    renderLesson();

    fireEvent.click(
      await screen.findByRole('checkbox', { name: 'Marcar concluída' }),
    );

    await waitFor(() => {
      expect(error).toHaveBeenCalledWith(
        'Não deu para marcar a aula. Tente de novo.',
      );
    });
    expect(
      screen.getByRole('checkbox', { name: 'Marcar concluída' }),
    ).toBeInTheDocument();
  });

  it('should resume the last lesson opened at the saved second', async () => {
    const duration = vi
      .spyOn(HTMLMediaElement.prototype, 'duration', 'get')
      .mockReturnValue(960);
    renderLesson();
    const player = await screen.findByLabelText<HTMLVideoElement>(
      'Vídeo da aula Filtrando',
    );

    fireEvent.loadedMetadata(player);

    expect(player.currentTime).toBe(252);
    duration.mockRestore();
  });

  it('should leave out the video, text and material a lesson does not have', async () => {
    const savePosition = vi
      .spyOn(EnrollmentService, 'savePosition')
      .mockResolvedValue();
    vi.spyOn(LessonService, 'open').mockResolvedValue({
      lessonId: 'l2',
      courseId: 'c1',
      body: '',
      attachments: [],
    });
    renderLesson();

    await screen.findByRole('heading', { level: 1, name: 'Filtrando' });
    expect(screen.queryByLabelText('Vídeo da aula Filtrando')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Material' })).toBeNull();
    expect(
      screen.getByRole('checkbox', { name: 'Marcar concluída' }),
    ).toBeInTheDocument();
    expect(savePosition).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l2', positionSeconds: 0 },
      { leaving: false },
    );
    expect(screen.getAllByRole('navigation', { name: /^Aulas/ })).toHaveLength(
      1,
    );
  });

  it('should leave out the lesson links in a course of one lesson', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue({
      ...outline,
      modules: [
        {
          id: 'm1',
          title: 'Único',
          position: 0,
          lessons: [
            { id: 'l2', title: 'Filtrando', durationMinutes: 16, position: 0 },
          ],
        },
      ],
    });
    renderLesson();

    await screen.findByRole('heading', { level: 1, name: 'Filtrando' });
    expect(screen.queryByRole('navigation', { name: /^Aulas/ })).toBeNull();
  });

  it('should send someone without an enrollment to the course page', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    renderLesson();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Curso' }),
    ).toBeVisible();
  });

  it('should say the lesson is not there and lead back to the course', async () => {
    vi.spyOn(LessonService, 'open').mockRejectedValue(
      apiError(404, 'LESSON_NOT_FOUND'),
    );
    renderLesson();

    expect(
      await screen.findByRole('heading', { name: 'Aula não encontrada' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Voltar ao curso' }),
    ).toHaveAttribute('href', '/cursos/c1');
  });

  it('should say the course is not there', async () => {
    vi.spyOn(LessonService, 'outline').mockRejectedValue(
      apiError(404, 'COURSE_NOT_FOUND'),
    );
    renderLesson();

    expect(
      await screen.findByRole('heading', { name: 'Curso não encontrado' }),
    ).toBeVisible();
  });

  it('should offer to try again after an answer it cannot read', async () => {
    vi.spyOn(LessonService, 'open')
      .mockRejectedValueOnce(new ZodError([]))
      .mockResolvedValueOnce(content);
    renderLesson();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Tentar de novo' }),
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Filtrando' }),
    ).toBeVisible();
  });
});
