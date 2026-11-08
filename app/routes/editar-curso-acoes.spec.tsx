import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditCoursePage from '~/routes/editar-curso';
import {
  InstructorService,
  type ManagedCourse,
} from '~/services/InstructorService';
import { LessonService } from '~/services/LessonService';
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

const dialog = () => screen.getByRole('alertdialog');

beforeEach(() => {
  vi.spyOn(LessonService, 'outline').mockResolvedValue({
    courseId: 'c1',
    title: 'Curso',
    status: 'DRAFT',
    modules: [],
  });
});

describe('course actions', () => {
  it('should hold publishing until the draft has a lesson', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue({
      ...draft,
      lessonCount: 0,
    });
    renderAt();

    const publish = await screen.findByRole('button', { name: 'Publicar' });

    expect(publish).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(publish);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(publish).toHaveAccessibleDescription(
      'Adicione ao menos uma aula para publicar.',
    );
  });

  it('should hold publishing and archiving while there are unsaved changes', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(published);
    renderAt();

    fireEvent.change(await screen.findByLabelText('Título'), {
      target: { value: 'Mudado' },
    });
    const archive = screen.getByRole('button', { name: 'Arquivar' });

    await waitFor(() => {
      expect(archive).toHaveAccessibleDescription(
        'Salve as alterações antes de arquivar.',
      );
    });
    fireEvent.click(archive);
    expect(screen.queryByRole('alertdialog')).toBeNull();
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

  it('should give the focus back to the button that opened a cancelled dialog', async () => {
    vi.spyOn(InstructorService, 'get').mockResolvedValue(published);
    renderAt();

    const archive = await screen.findByRole('button', { name: 'Arquivar' });
    fireEvent.click(archive);
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(archive).toHaveFocus();
    });
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
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: draft.title }),
      ).toHaveFocus();
    });
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
    expect(dialog()).toHaveTextContent(
      'será apagado com as 12 aulas. Isso não pode ser desfeito.',
    );
    fireEvent.click(
      within(dialog()).getByRole('button', { name: 'Apagar rascunho' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Meus cursos' }),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(remove).toHaveBeenCalledWith('c1');
  });
});
