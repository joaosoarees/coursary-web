import { fireEvent, screen } from '@testing-library/react';
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
    expect(screen.getByText('Módulo 2 · Aula 2 de 3 · 16 min')).toBeVisible();
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

  it('should lead to the lessons before and after and back to the course', async () => {
    renderLesson();

    expect(
      await screen.findByRole('link', { name: 'Aula anterior' }),
    ).toHaveAttribute('href', '/cursos/c1/aulas/l1');
    expect(screen.getByRole('link', { name: 'Próxima aula' })).toHaveAttribute(
      'href',
      '/cursos/c1/aulas/l3',
    );
    expect(
      screen.getByRole('link', { name: 'Python para análise de dados' }),
    ).toHaveAttribute('href', '/cursos/c1');
  });

  it('should lead back to the enrollments when the course is archived', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue({
      ...outline,
      status: 'ARCHIVED',
    });
    renderLesson();

    expect(
      await screen.findByRole('link', { name: 'Minhas matrículas' }),
    ).toHaveAttribute('href', '/minhas-matriculas');
  });

  it('should leave out the video, text and material a lesson does not have', async () => {
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
