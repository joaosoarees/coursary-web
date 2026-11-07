import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CoursePageRoute from '~/routes/curso';
import {
  type CoursePage,
  CourseService,
  type Review,
} from '~/services/CourseService';
import { EnrollmentService, type Progress } from '~/services/EnrollmentService';
import { ReviewService } from '~/services/ReviewService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const course: CoursePage = {
  id: 'c1',
  title: 'Python para análise de dados',
  description: 'Do primeiro notebook a um relatório com gráficos.',
  instructorName: 'Juliana Prado',
  lessonCount: 2,
  enrollmentCount: 221,
  ratingCount: 36,
  ratingAverage: 4.8,
  publishedAt: '2026-10-01T00:00:00.000Z',
  modules: [
    {
      id: 'm1',
      title: 'Primeiros passos',
      position: 0,
      lessons: [
        {
          id: 'l1',
          title: 'Instalando o ambiente',
          durationMinutes: 8,
          position: 0,
        },
        {
          id: 'l2',
          title: 'Seu primeiro notebook',
          durationMinutes: 12,
          position: 1,
        },
      ],
    },
  ],
};

const review = (studentName: string): Review => ({
  studentName,
  rating: 4,
  comment: 'Explicações curtas e exemplos que uso no trabalho.',
  createdAt: '2026-10-28T12:00:00.000Z',
  updatedAt: '2026-10-28T12:00:00.000Z',
});

const progress: Progress = {
  completedLessons: 1,
  completedLessonIds: ['l1'],
  lastLessonId: 'l1',
  positionSeconds: null,
};

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {
        return undefined;
      }

      disconnect() {
        return undefined;
      }
    },
  );
  vi.spyOn(CourseService, 'get').mockResolvedValue(course);
  vi.spyOn(ReviewService, 'mine').mockResolvedValue(null);
  vi.spyOn(CourseService, 'listReviews').mockResolvedValue({
    items: [review('Ana Souza')],
    nextCursor: null,
  });
});

const renderCourse = () =>
  renderRoutes(
    [{ path: '/cursos/:id', Component: CoursePageRoute }],
    '/cursos/c1',
  );

describe('the course page', () => {
  it('should show the course, its outline and its reviews', async () => {
    const get = vi.spyOn(CourseService, 'get').mockResolvedValue(course);
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    renderCourse();

    expect(
      await screen.findByRole('heading', { level: 1, name: course.title }),
    ).toBeVisible();
    expect(screen.getByText('2 aulas em 1 módulo')).toBeVisible();
    expect(screen.getByText('Seu primeiro notebook')).toBeVisible();
    expect(await screen.findByText('Ana Souza')).toBeVisible();
    expect(screen.getByRole('img', { name: '4 de 5' })).toBeVisible();
    expect(get).toHaveBeenCalledWith('c1', expect.any(AbortSignal));
  });

  it('should title the tab with the course once it loads', async () => {
    vi.spyOn(CourseService, 'get').mockResolvedValue(course);
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    renderCourse();

    await screen.findByRole('heading', { level: 1, name: course.title });

    expect(document.title).toBe(`${course.title} · Coursary`);
  });

  it('should sum up the outline and lead an enrolled student on', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(progress);
    renderCourse();

    expect(
      await screen.findByRole('link', { name: 'Continuar de onde parei' }),
    ).toHaveAttribute('href', '/cursos/c1/continuar');
    expect(
      screen.getByText('Aula 1 de 2 · Instalando o ambiente'),
    ).toBeVisible();
    expect(screen.getByText('2 aulas · 20 min')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Instalando o ambiente/ }),
    ).toHaveAttribute('href', '/cursos/c1/aulas/l1');
  });

  it('should let an enrolled student review the course from the panel', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(progress);
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Avaliar o curso' }),
    );

    expect(
      screen.getByRole('dialog', { name: 'Avaliar o curso' }),
    ).toBeVisible();
  });

  it('should offer to review a finished course', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue({
      ...progress,
      completedLessons: 2,
      completedLessonIds: ['l1', 'l2'],
    });
    renderCourse();

    expect(
      await screen.findByRole('link', { name: 'Rever o curso' }),
    ).toHaveAttribute('href', '/cursos/c1/continuar');
  });

  it('should enroll and then show the enrollment', async () => {
    const read = vi
      .spyOn(EnrollmentService, 'progress')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(progress);
    const enroll = vi.spyOn(EnrollmentService, 'enroll').mockResolvedValue();
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Matricular-me' }),
    );

    expect(await screen.findByText('Você está matriculado')).toBeVisible();
    expect(enroll).toHaveBeenCalledWith('c1');
    expect(read).toHaveBeenCalledTimes(2);
  });

  it('should cancel only after the confirmation', async () => {
    vi.spyOn(EnrollmentService, 'progress')
      .mockResolvedValueOnce(progress)
      .mockResolvedValueOnce(null);
    const cancel = vi.spyOn(EnrollmentService, 'cancel').mockResolvedValue();
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Cancelar matrícula' }),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Cancelar a matrícula?',
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Manter matrícula' }),
    );

    expect(cancel).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar matrícula' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar matrícula',
      }),
    );

    expect(
      await screen.findByRole('button', { name: 'Matricular-me' }),
    ).toBeVisible();
    expect(cancel).toHaveBeenCalledWith('c1');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should keep the confirmation open while the cancel is sent', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(progress);
    vi.spyOn(EnrollmentService, 'cancel').mockReturnValue(
      new Promise(() => undefined),
    );
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Cancelar matrícula' }),
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Cancelar matrícula' }),
    );
    await screen.findByRole('button', { name: 'Cancelando…' });
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should tell instructors that the course is theirs', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    vi.spyOn(EnrollmentService, 'enroll').mockRejectedValue(
      apiError(409, 'OWN_COURSE'),
    );
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Matricular-me' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você é o instrutor deste curso.',
    );
    expect(
      screen.getByRole('button', { name: 'Matricular-me' }),
    ).toBeDisabled();
  });

  it('should say when the course does not exist', async () => {
    vi.spyOn(CourseService, 'get').mockRejectedValue(
      apiError(404, 'COURSE_NOT_FOUND'),
    );
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    renderCourse();

    expect(
      await screen.findByRole('heading', { name: 'Curso não encontrado' }),
    ).toBeVisible();
  });

  it('should load more reviews on request', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    const list = vi
      .spyOn(CourseService, 'listReviews')
      .mockResolvedValueOnce({ items: [review('Ana Souza')], nextCursor: 'r2' })
      .mockResolvedValueOnce({
        items: [review('Pedro Lima')],
        nextCursor: null,
      });
    renderCourse();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Carregar mais avaliações' }),
    );

    expect(await screen.findByText('Pedro Lima')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { courseId: 'c1', cursor: 'r2', limit: 10 },
      expect.any(AbortSignal),
    );
  });
});
