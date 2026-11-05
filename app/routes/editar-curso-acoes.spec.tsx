import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EditCoursePage from '~/routes/editar-curso';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

const draft: ManagedCourse = {
  id: 'c1',
  title: 'Gráficos que contam uma história',
  description: '',
  status: 'DRAFT',
  lessonCount: 12,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

const published: ManagedCourse = {
  ...draft,
  status: 'PUBLISHED',
  enrollmentCount: 1284,
  publishedAt: '2026-09-28T12:00:00.000Z',
};

const renderAt = () =>
  renderRoutes(
    [
      { path: '/instrutor/cursos/:id', Component: EditCoursePage },
      {
        path: '/instrutor/cursos',
        Component: () => <Landing title="Meus cursos" />,
      },
    ],
    '/instrutor/cursos/c1',
  );

const dialog = () => screen.getByRole('dialog');

describe('course actions', () => {
  it('should hold publishing until the draft has a lesson', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...draft,
      lessonCount: 0,
    });
    renderAt();

    const publish = await screen.findByRole('button', { name: 'Publicar' });

    expect(publish).toBeDisabled();
    expect(publish).toHaveAccessibleDescription(
      'Adicione ao menos uma aula para publicar.',
    );
  });

  it('should publish a draft after confirming', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(draft);
    const publish = vi
      .spyOn(InstructorService, 'publish')
      .mockResolvedValue(published);
    renderAt();

    fireEvent.click(await screen.findByRole('button', { name: 'Publicar' }));
    expect(dialog()).toHaveTextContent('Ele não volta a ser rascunho');
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Publicar' }));

    expect(await screen.findByText('Publicado')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Ver a página do curso' }),
    ).toHaveAttribute('href', '/cursos/c1');
    expect(publish).toHaveBeenCalledWith('c1');
  });

  it('should keep the dialog open with the reason when publishing is refused', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(draft);
    vi.spyOn(InstructorService, 'publish').mockRejectedValue(
      apiError(409, 'COURSE_EMPTY'),
    );
    renderAt();

    fireEvent.click(await screen.findByRole('button', { name: 'Publicar' }));
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Publicar' }));

    expect(await within(dialog()).findByRole('alert')).toHaveTextContent(
      'Adicione ao menos uma aula para publicar.',
    );
  });

  it('should archive a published course and say who keeps access', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(published);
    vi.spyOn(InstructorService, 'archive').mockResolvedValue({
      ...published,
      status: 'ARCHIVED',
    });
    renderAt();

    fireEvent.click(await screen.findByRole('button', { name: 'Arquivar' }));
    expect(dialog()).toHaveTextContent(
      'Os 1.284 alunos matriculados continuam com acesso',
    );
    fireEvent.click(
      within(dialog()).getByRole('button', { name: 'Arquivar o curso' }),
    );

    expect(await screen.findByRole('note')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Arquivar' })).toBeNull();
  });

  it('should delete a draft and go back to my courses even with unsaved changes', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(draft);
    const remove = vi
      .spyOn(InstructorService, 'deleteDraft')
      .mockResolvedValue(undefined);
    renderAt();

    fireEvent.change(await screen.findByLabelText('Título'), {
      target: { value: 'Mudado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apagar rascunho' }));
    expect(dialog()).toHaveTextContent('Isso não pode ser desfeito');
    fireEvent.click(
      within(dialog()).getByRole('button', { name: 'Apagar rascunho' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Meus cursos' }),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(remove).toHaveBeenCalledWith('c1');
  });
});
