import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MyCoursesPage from '~/routes/meus-cursos';
import { InstructorService, type MyCourse } from '~/services/InstructorService';
import { Landing, renderRoutes } from '~/test/renderRoutes';

const course = (
  id: string,
  title: string,
  extra: Partial<MyCourse> = {},
): MyCourse => ({
  id,
  title,
  status: 'DRAFT',
  lessonCount: 0,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
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
      { path: '/instrutor/cursos', Component: MyCoursesPage },
      {
        path: '/instrutor/cursos/novo',
        Component: () => <Landing title="Novo curso" />,
      },
    ],
    '/instrutor/cursos',
  );

describe('my courses', () => {
  it('should list each course with its status and facts', async () => {
    vi.spyOn(InstructorService, 'listMine').mockResolvedValue({
      items: [
        course('c1', 'Gráficos que contam uma história'),
        course('c2', 'Planilhas sem medo', {
          status: 'PUBLISHED',
          lessonCount: 31,
          enrollmentCount: 1,
          publishedAt: '2026-09-28T12:00:00.000Z',
        }),
      ],
      nextCursor: null,
    });
    renderAt();

    expect(
      await screen.findByRole('link', {
        name: /Gráficos que contam uma história/,
      }),
    ).toHaveAttribute('href', '/instrutor/cursos/c1');
    expect(screen.getByText('Rascunho')).toBeVisible();
    expect(
      screen.getByText('Nenhuma aula ainda · criado em 4 de nov. de 2026'),
    ).toBeVisible();
    expect(screen.getByText('Publicado')).toBeVisible();
    expect(
      screen.getByText('31 aulas · 1 aluno · publicado em 28 de set. de 2026'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Novo curso' })).toHaveAttribute(
      'href',
      '/instrutor/cursos/novo',
    );
  });

  it('should invite an instructor with no course to create the first', async () => {
    vi.spyOn(InstructorService, 'listMine').mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    renderAt();

    expect(
      await screen.findByRole('heading', {
        name: 'Você ainda não criou nenhum curso',
      }),
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Novo curso' })).toBeNull();
    fireEvent.click(
      screen.getByRole('link', { name: 'Criar o primeiro curso' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Novo curso' }),
    ).toBeVisible();
  });

  it('should load more courses on request', async () => {
    const list = vi
      .spyOn(InstructorService, 'listMine')
      .mockResolvedValueOnce({
        items: [course('c1', 'Gráficos que contam uma história')],
        nextCursor: 'n2',
      })
      .mockResolvedValueOnce({
        items: [course('c2', 'Planilhas sem medo')],
        nextCursor: null,
      });
    renderAt();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Carregar mais cursos' }),
    );

    expect(
      await screen.findByRole('link', { name: /Planilhas sem medo/ }),
    ).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { cursor: 'n2', limit: 12 },
      expect.any(AbortSignal),
    );
  });
});
