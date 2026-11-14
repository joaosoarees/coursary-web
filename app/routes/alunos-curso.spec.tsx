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
import { ExportService } from '~/services/ExportService';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { type Student, StudentService } from '~/services/StudentService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const course: ManagedCourse = {
  id: 'c1',
  instructorId: 'i1',
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
              items: order === 'asc' ? firstPage.toReversed() : firstPage,
              nextCursor: 'n2',
            },
      ),
    );
});

const renderPage = (search = '') =>
  renderRoutes(
    [{ path: '/instrutor/cursos/:id/alunos', Component: CourseStudentsPage }],
    `/instrutor/cursos/c1/alunos${search}`,
  );

describe('course students', () => {
  it('should list the newest students first and page to the next ones', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Alunos' }),
    ).toBeVisible();
    expect(await screen.findByText('Aluno 1')).toBeVisible();
    expect(screen.getByText('Mostrando 1–20 de 21')).toBeVisible();
    expect(document.title).toBe(
      'Alunos · Python para análise de dados · Coursary',
    );
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeVisible();

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

    fireEvent.click(await screen.findByRole('button', { name: /^Matrícula/ }));

    expect(await screen.findByText('Mostrando 1–20 de 21')).toBeVisible();
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Aluno 20');
    expect(list).toHaveBeenCalledWith(
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
    expect(screen.queryByRole('button', { name: 'Exportar CSV' })).toBeNull();
    expect(screen.queryByText(/aulas$/)).toBeNull();
  });

  it('should point a published course without students to its page', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...course,
      enrollmentCount: 0,
    });
    list.mockResolvedValue({ items: [], nextCursor: null });
    renderPage();

    expect(
      await screen.findByRole('link', { name: 'Ver a página do curso' }),
    ).toHaveAttribute('href', '/cursos/c1');
  });

  it('should say an archived course takes no new students', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...course,
      status: 'ARCHIVED',
      enrollmentCount: 0,
    });
    list.mockResolvedValue({ items: [], nextCursor: null });
    renderPage();

    expect(
      await screen.findByText(/não recebe matrículas novas/),
    ).toBeVisible();
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

  it('should offer the CSV a bell notice leads to, without exporting again', async () => {
    const request = vi.spyOn(ExportService, 'request');
    const get = vi.spyOn(ExportService, 'get').mockResolvedValue({
      id: 'e1',
      courseId: 'c1',
      status: 'READY',
      createdAt: '2026-11-13T12:00:00.000Z',
      rowCount: 21,
      downloadUrl: 'https://bucket.example/exports/c1/e1.csv',
      expiresIn: 300,
    });
    renderPage('?export=e1');

    expect(
      await screen.findByRole('link', { name: 'Baixar CSV' }),
    ).toHaveAttribute('href', 'https://bucket.example/exports/c1/e1.csv');
    expect(get).toHaveBeenCalledExactlyOnceWith('e1');
    expect(request).not.toHaveBeenCalled();
  });

  it('should say the CSV a bell notice leads to has expired', async () => {
    vi.spyOn(ExportService, 'get').mockRejectedValue(
      apiError(404, 'EXPORT_NOT_FOUND'),
    );
    renderPage('?export=e1');

    expect(
      await screen.findByText('Este CSV expirou. Exporte de novo.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeVisible();
  });
});
