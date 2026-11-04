import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MyEnrollmentsPage from '~/routes/minhas-matriculas';
import {
  EnrollmentService,
  type EnrollmentSummary,
} from '~/services/EnrollmentService';
import { Landing, renderRoutes } from '~/test/renderRoutes';

const enrollment = (
  courseId: string,
  title: string,
  extra: Partial<EnrollmentSummary> = {},
): EnrollmentSummary => ({
  courseId,
  title,
  instructorName: 'Juliana Prado',
  lessonCount: 42,
  completedLessons: 10,
  enrolledAt: '2026-10-01T00:00:00.000Z',
  courseStatus: 'PUBLISHED',
  ...extra,
});

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
});

const renderAt = () =>
  renderRoutes(
    [
      { path: '/minhas-matriculas', Component: MyEnrollmentsPage },
      { path: '/cursos', Component: () => <Landing title="Catálogo" /> },
    ],
    '/minhas-matriculas',
  );

describe('my enrollments', () => {
  it('should list the courses with their progress and archived ones marked', async () => {
    vi.spyOn(EnrollmentService, 'listMine').mockResolvedValue({
      items: [
        enrollment('c1', 'Python para análise de dados'),
        enrollment('c2', 'Fotografia com o celular', {
          courseStatus: 'ARCHIVED',
          lessonCount: 24,
          completedLessons: 24,
        }),
      ],
      nextCursor: null,
    });
    renderAt();

    expect(
      await screen.findByRole('link', { name: /Python para análise de dados/ }),
    ).toHaveAttribute('href', '/cursos/c1/continuar');
    expect(screen.getByText(/10 de 42 aulas/)).toBeVisible();
    expect(screen.getByText('Concluído')).toBeVisible();
    expect(screen.getAllByText('Arquivado')).toHaveLength(1);
  });

  it('should send students with no enrollment to the catalog', async () => {
    vi.spyOn(EnrollmentService, 'listMine').mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    renderAt();

    expect(
      await screen.findByRole('heading', {
        name: 'Você ainda não se matriculou em nenhum curso',
      }),
    ).toBeVisible();
    expect(
      screen.getByText('Os cursos em que você está matriculado.'),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('link', { name: 'Explorar o catálogo' }));

    expect(
      await screen.findByRole('heading', { name: 'Catálogo' }),
    ).toBeVisible();
  });

  it('should load more enrollments on request', async () => {
    const list = vi
      .spyOn(EnrollmentService, 'listMine')
      .mockResolvedValueOnce({
        items: [enrollment('c1', 'Python para análise de dados')],
        nextCursor: 'e2',
      })
      .mockResolvedValueOnce({
        items: [enrollment('c2', 'Planilhas sem medo')],
        nextCursor: null,
      });
    renderAt();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Carregar mais matrículas' }),
    );

    expect(
      await screen.findByRole('link', { name: /Planilhas sem medo/ }),
    ).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { cursor: 'e2', limit: 12 },
      expect.any(AbortSignal),
    );
  });
});
