import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { CourseContent } from '~/instructor/content/CourseContent';
import type { CourseModule } from '~/services/CourseService';
import type { ManagedCourse } from '~/services/InstructorService';
import { LessonService } from '~/services/LessonService';
import { OutlineService } from '~/services/OutlineService';

const course: ManagedCourse = {
  id: 'c1',
  title: 'Gráficos',
  description: '',
  status: 'DRAFT',
  lessonCount: 3,
  enrollmentCount: 0,
  publishedAt: null,
  createdAt: '2026-11-04T12:00:00.000Z',
};

const lesson = (id: string, title: string, durationMinutes = 10) => ({
  id,
  title,
  durationMinutes,
  position: 0,
});

const modules: CourseModule[] = [
  {
    id: 'm1',
    title: 'Escolhendo o gráfico',
    position: 0,
    lessons: [lesson('l1', 'Barras ou linhas?'), lesson('l2', 'A pizza')],
  },
  {
    id: 'm2',
    title: 'Limpando o excesso',
    position: 1,
    lessons: [lesson('l3', 'Menos tinta')],
  },
  { id: 'm3', title: 'Escrevendo o título', position: 2, lessons: [] },
];

const renderContent = (shown: ManagedCourse = course) => {
  vi.spyOn(LessonService, 'outline').mockResolvedValue({
    courseId: 'c1',
    title: shown.title,
    status: shown.status,
    modules,
  });
  const Stub = createRoutesStub([
    { path: '/', Component: () => <CourseContent course={shown} /> },
  ]);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Stub initialEntries={['/']} />
    </QueryClientProvider>,
  );
};

const titles = () =>
  screen.getAllByRole('link').map((link) => link.textContent);

describe('CourseContent', () => {
  it('should list the modules and lessons with their facts and numbers', async () => {
    renderContent();

    expect(
      await screen.findByText(
        '3 módulos · 3 aulas · 30 min. Arraste ou use as setas para mudar a ordem.',
      ),
    ).toBeVisible();
    expect(titles()).toEqual(['Barras ou linhas?', 'A pizza', 'Menos tinta']);
    expect(screen.getByRole('link', { name: 'Menos tinta' })).toHaveAttribute(
      'href',
      '/instrutor/cursos/c1/aulas/l3',
    );
    expect(screen.getByText('2 aulas · 20 min')).toBeVisible();
  });

  it('should save a lesson moved with the arrows at once', async () => {
    const reorder = vi
      .spyOn(OutlineService, 'reorder')
      .mockImplementation(() => new Promise(() => undefined));
    renderContent();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Descer a aula Barras ou linhas?',
      }),
    );

    await waitFor(() => {
      expect(titles()).toEqual(['A pizza', 'Barras ou linhas?', 'Menos tinta']);
    });
    expect(reorder).toHaveBeenCalledWith('c1', {
      modules: [
        { id: 'm1', lessonIds: ['l2', 'l1'] },
        { id: 'm2', lessonIds: ['l3'] },
        { id: 'm3', lessonIds: [] },
      ],
    });
  });

  it('should put the order back when the API refuses it', async () => {
    vi.spyOn(OutlineService, 'reorder').mockRejectedValue(new Error('down'));
    renderContent();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Subir o módulo Limpando o excesso',
      }),
    );

    await waitFor(() => {
      expect(titles()).toEqual(['Barras ou linhas?', 'A pizza', 'Menos tinta']);
    });
  });

  it('should create a lesson from the dialog of its module', async () => {
    const create = vi.spyOn(OutlineService, 'createLesson').mockResolvedValue({
      id: 'l9',
      moduleId: 'm3',
      title: 'O título conclui',
      durationMinutes: 11,
      position: 0,
    });
    renderContent();

    const module = (
      await screen.findByRole('heading', { name: /Escrevendo o título/ })
    ).closest('li');
    fireEvent.click(
      within(module as HTMLElement).getByRole('button', { name: 'Nova aula' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Nova aula' });
    fireEvent.change(within(dialog).getByLabelText('Título'), {
      target: { value: 'O título conclui' },
    });
    fireEvent.change(within(dialog).getByLabelText('Duração'), {
      target: { value: '11' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Criar aula' }));

    expect(
      await screen.findByRole('link', { name: 'O título conclui' }),
    ).toBeVisible();
    expect(create).toHaveBeenCalledWith('c1', 'm3', {
      title: 'O título conclui',
      durationMinutes: 11,
    });
  });

  it('should hold deleting a module that still has lessons', async () => {
    renderContent();

    const full = await screen.findByRole('button', {
      name: 'Apagar o módulo Escolhendo o gráfico',
    });

    expect(full).toHaveAttribute('aria-disabled', 'true');
    expect(full).toHaveAccessibleDescription(
      'Tire as aulas do módulo para apagá-lo.',
    );
    expect(
      screen.getByRole('button', {
        name: 'Apagar o módulo Escrevendo o título',
      }),
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should keep a published course from deleting and an archived one from changing', async () => {
    const { unmount } = renderContent({ ...course, status: 'PUBLISHED' });

    expect(
      await screen.findByText(/aulas e módulos não podem ser apagados/),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Apagar/ })).toBeNull();

    unmount();
    renderContent({ ...course, status: 'ARCHIVED' });

    await screen.findByRole('link', { name: 'Menos tinta' });
    expect(screen.queryByRole('button')).toBeNull();
  });
});
