import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CatalogPage from '~/routes/cursos';
import { type CatalogItem, CatalogService } from '~/services/CatalogService';
import { Landing, renderRoutes } from '~/test/renderRoutes';

const course = (id: string, title: string): CatalogItem => ({
  id,
  title,
  instructorName: 'Juliana Prado',
  lessonCount: 10,
  enrollmentCount: 221,
  ratingCount: 0,
  ratingAverage: null,
  publishedAt: '2026-10-01T00:00:00.000Z',
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

const renderAt = (path: string) =>
  renderRoutes(
    [
      { path: '/cursos', Component: CatalogPage },
      { path: '/cursos/:id', Component: () => <Landing title="Curso" /> },
    ],
    path,
  );

describe('the catalog', () => {
  it('should list the courses and load more on request', async () => {
    const list = vi
      .spyOn(CatalogService, 'list')
      .mockResolvedValueOnce({
        items: [course('c1', 'Python para dados'), course('c2', 'Planilhas')],
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [course('c3', 'Fotografia')],
        nextCursor: null,
      });
    renderAt('/cursos');

    expect(await screen.findByText('Mostrando 2 cursos')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Carregar mais cursos' }),
    );

    expect(await screen.findByText('Mostrando 3 cursos')).toBeVisible();
    expect(list).toHaveBeenLastCalledWith(
      { cursor: 'cursor-2', limit: 12 },
      expect.any(AbortSignal),
    );
    expect(
      screen.queryByRole('button', { name: 'Carregar mais cursos' }),
    ).toBeNull();
  });

  it('should say when nothing is published yet', async () => {
    vi.spyOn(CatalogService, 'list').mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    renderAt('/cursos');

    expect(
      await screen.findByText('Nenhum curso publicado ainda'),
    ).toBeVisible();
  });

  it('should search from the form', async () => {
    vi.spyOn(CatalogService, 'list').mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    const search = vi.spyOn(CatalogService, 'search').mockResolvedValue({
      items: [course('c1', 'Python para dados')],
      page: 0,
      totalPages: 1,
      totalItems: 1,
    });
    renderAt('/cursos');

    fireEvent.change(
      await screen.findByRole('searchbox', { name: 'Buscar cursos' }),
      {
        target: { value: 'dados' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Resultados para “dados”' }),
    ).toBeVisible();
    expect(search).toHaveBeenCalledWith(
      { query: 'dados', page: 0, perPage: 12 },
      expect.any(AbortSignal),
    );
  });

  it('should page through the results by the URL', async () => {
    const search = vi.spyOn(CatalogService, 'search').mockResolvedValue({
      items: [course('c1', 'Python para dados')],
      page: 1,
      totalPages: 7,
      totalItems: 80,
    });
    renderAt('/cursos?busca=dados&pagina=2');

    expect(await screen.findByText('Página 2 de 7')).toBeVisible();
    expect(search).toHaveBeenCalledWith(
      { query: 'dados', page: 1, perPage: 12 },
      expect.any(AbortSignal),
    );
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute(
      'href',
      '/cursos?busca=dados&pagina=1',
    );
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute(
      'href',
      '/cursos?busca=dados&pagina=3',
    );
  });

  it('should offer to clear a search with no result', async () => {
    vi.spyOn(CatalogService, 'search').mockResolvedValue({
      items: [],
      page: 0,
      totalPages: 0,
      totalItems: 0,
    });
    renderAt('/cursos?busca=violino');

    expect(
      await screen.findByText('Nenhum curso para “violino”'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Limpar busca' })).toHaveAttribute(
      'href',
      '/cursos',
    );
  });

  it('should not answer a new search with the results of the last one', async () => {
    const slow = Promise.withResolvers<{
      items: ReturnType<typeof course>[];
      page: number;
      totalPages: number;
      totalItems: number;
    }>();
    vi.spyOn(CatalogService, 'search')
      .mockResolvedValueOnce({
        items: [],
        page: 0,
        totalPages: 0,
        totalItems: 0,
      })
      .mockReturnValueOnce(slow.promise);
    renderAt('/cursos?busca=violino');

    await screen.findByText('Nenhum curso para “violino”');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cursos' }), {
      target: { value: 'python' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Carregando cursos…')).toBeInTheDocument();
    expect(screen.queryByText('Nenhum curso para “python”')).toBeNull();

    slow.resolve({
      items: [course('c1', 'Python para dados')],
      page: 0,
      totalPages: 1,
      totalItems: 1,
    });

    expect((await screen.findAllByText('Python para dados'))[0]).toBeVisible();
  });

  it('should lead back from a search page past the last one', async () => {
    vi.spyOn(CatalogService, 'search').mockResolvedValue({
      items: [],
      page: 39,
      totalPages: 7,
      totalItems: 80,
    });
    renderAt('/cursos?busca=dados&pagina=40');

    expect(
      await screen.findByText('Esta página da busca não existe'),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ir para a primeira página' }),
    ).toHaveAttribute('href', '/cursos?busca=dados&pagina=1');
  });
});
