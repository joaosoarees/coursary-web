import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NewCoursePage from '~/routes/novo-curso';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const created: ManagedCourse = {
  id: 'c9',
  title: 'Gráficos que contam uma história',
  description: 'Sobre gráficos',
  status: 'DRAFT',
  lessonCount: 0,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-05T12:00:00.000Z',
};

const renderAt = () =>
  renderRoutes(
    [
      { path: '/instrutor/cursos/novo', Component: NewCoursePage },
      {
        path: '/instrutor/cursos/:id',
        Component: () => <Landing title="Editar curso" />,
      },
    ],
    '/instrutor/cursos/novo',
  );

const fill = (title: string, description = '') => {
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText(/Descrição/), {
    target: { value: description },
  });
};

describe('new course', () => {
  it('should create the draft and open its edit page', async () => {
    const create = vi
      .spyOn(InstructorService, 'create')
      .mockResolvedValue(created);
    renderAt();

    fill(' Gráficos que contam uma história ', 'Sobre gráficos');
    expect(screen.getByText('14 de 5000')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(
      await screen.findByRole('heading', { name: 'Editar curso' }),
    ).toBeVisible();
    expect(create).toHaveBeenCalledWith({
      title: 'Gráficos que contam uma história',
      description: 'Sobre gráficos',
    });
  });

  it('should refuse a title under 3 characters without calling the API', async () => {
    const create = vi.spyOn(InstructorService, 'create');
    renderAt();

    fill('Gr');
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(
      await screen.findByText('Use ao menos 3 caracteres no título.'),
    ).toBeVisible();
    expect(screen.getByLabelText('Título')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('should ask for a title when there is none', async () => {
    renderAt();

    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(await screen.findByText('Dê um título ao curso.')).toBeVisible();
  });

  it('should say when the API refuses the draft', async () => {
    vi.spyOn(InstructorService, 'create').mockRejectedValue(
      apiError(500, 'INTERNAL'),
    );
    renderAt();

    fill('Gráficos');
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível concluir. Tente de novo.',
    );
  });
});
