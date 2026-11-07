import { fireEvent, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import CourseStudentsPage from '~/routes/alunos-curso';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { type Student, StudentService } from '~/services/StudentService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const course: ManagedCourse = {
  id: 'c1',
  title: 'Python para análise de dados',
  description: 'Sobre dados',
  status: 'PUBLISHED',
  lessonCount: 12,
  enrollmentCount: 21,
  publishedAt: '2026-10-01T12:00:00.000Z',
  createdAt: '2026-09-01T12:00:00.000Z',
};

const student = (n: number): Student => ({
  accountId: `a${String(n)}`,
  studentName: `Aluno ${String(n)}`,
  enrolledAt: '2026-11-01T12:00:00.000Z',
  completedLessons: 3,
});

const firstPage = Array.from({ length: 20 }, (_, i) => student(i + 1));

let list: MockInstance<typeof StudentService.list>;

beforeEach(() => {
  vi.spyOn(InstructorService, 'get').mockResolvedValue(course);
  list = vi
    .spyOn(StudentService, 'list')
    .mockImplementation((_courseId, { cursor, order }) =>
      Promise.resolve(
        cursor
          ? { items: [student(21)], nextCursor: null }
          : {
              items: order === 'asc' ? [student(21)] : firstPage,
              nextCursor: order === 'asc' ? null : 'n2',
            },
      ),
    );
});

const renderPage = () =>
  renderRoutes(
    [{ path: '/instrutor/cursos/:id/alunos', Component: CourseStudentsPage }],
    '/instrutor/cursos/c1/alunos',
  );

describe('course students', () => {
  it('should list the newest students first and page to the next ones', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Alunos' }),
    ).toBeVisible();
    expect(await screen.findByText('Aluno 1')).toBeVisible();
    expect(screen.getByText('Mostrando 1–20 de 21')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(await screen.findByText('Aluno 21')).toBeVisible();
    expect(screen.getByText('Página 2 de 2')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      'c1',
      { cursor: 'n2', order: 'desc', limit: 20 },
      expect.anything(),
    );
  });

  it('should ask for the oldest first from the first page', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: /Matriculado em/ }),
    );

    expect(await screen.findByText('Página 1 de 2')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      'c1',
      { cursor: undefined, order: 'asc', limit: 20 },
      expect.anything(),
    );
  });

  it('should say a draft gets students once published', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...course,
      status: 'DRAFT',
      enrollmentCount: 0,
    });
    list.mockResolvedValue({ items: [], nextCursor: null });
    renderPage();

    expect(
      await screen.findByRole('heading', {
        name: 'Ninguém se matriculou ainda',
      }),
    ).toBeVisible();
    expect(screen.getByText(/depois de publicado/)).toBeVisible();
  });

  it('should say a course that is not yours is not found', async () => {
    vi.spyOn(InstructorService, 'get').mockRejectedValue(
      apiError(403, 'FORBIDDEN'),
    );
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Curso não encontrado' }),
    ).toBeVisible();
  });
});
