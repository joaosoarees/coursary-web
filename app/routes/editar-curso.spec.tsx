import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EditCoursePage from '~/routes/editar-curso';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { apiError, renderRoutes } from '~/test/renderRoutes';

const draft: ManagedCourse = {
  id: 'c1',
  title: 'Gráficos que contam uma história',
  description: 'Sobre gráficos',
  status: 'DRAFT',
  lessonCount: 0,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

const renderAt = () =>
  renderRoutes(
    [{ path: '/instrutor/cursos/:id', Component: EditCoursePage }],
    '/instrutor/cursos/c1',
  );

describe('edit course', () => {
  it('should save a changed title and show it as saved', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(draft);
    const update = vi
      .spyOn(InstructorService, 'update')
      .mockResolvedValue({ ...draft, title: 'Gráficos com propósito' });
    renderAt();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Gráficos que contam uma história',
      }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Enviar capa/ })).toBeVisible();

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Gráficos com propósito' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Gráficos com propósito',
      }),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue(
        'Gráficos com propósito',
      );
    });
    expect(update).toHaveBeenCalledWith('c1', {
      title: 'Gráficos com propósito',
      description: 'Sobre gráficos',
    });
  });

  it('should not send an unchanged form', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(draft);
    const update = vi.spyOn(InstructorService, 'update');
    renderAt();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Salvar alterações' }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Salvar alterações' }),
      ).not.toHaveAttribute('aria-disabled', 'true');
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('should show an archived course read-only', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...draft,
      status: 'ARCHIVED',
      enrollmentCount: 96,
      publishedAt: '2026-03-03T12:00:00.000Z',
    });
    renderAt();

    expect(await screen.findByRole('note')).toHaveTextContent(
      'os 96 alunos matriculados continuam com acesso',
    );
    expect(screen.getByLabelText('Título')).toHaveAttribute('readonly');
    expect(screen.queryByText(/de 5000/)).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Salvar alterações' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: /capa/ })).toBeNull();
  });

  it('should say a course of someone else is not found', async () => {
    vi.spyOn(InstructorService, 'get').mockRejectedValue(
      apiError(403, 'FORBIDDEN'),
    );
    renderAt();

    expect(
      await screen.findByRole('heading', { name: 'Curso não encontrado' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ir para Meus cursos' }),
    ).toHaveAttribute('href', '/instrutor/cursos');
  });
});
