import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { CourseOutline } from '~/components/course/CourseOutline';
import type { CourseModule } from '~/services/CourseService';
import type { Progress } from '~/services/EnrollmentService';

const modules: CourseModule[] = [
  {
    id: 'm1',
    title: 'Primeiros passos',
    position: 0,
    lessons: [
      { id: 'l1', title: 'Instalando', durationMinutes: 50, position: 0 },
      { id: 'l2', title: 'Notebook', durationMinutes: 25, position: 1 },
    ],
  },
  {
    id: 'm2',
    title: 'Pandas',
    position: 1,
    lessons: [
      { id: 'l3', title: 'Filtrando', durationMinutes: 16, position: 0 },
    ],
  },
];

const progress = (completedLessonIds: string[]): Progress => ({
  completedLessons: completedLessonIds.length,
  completedLessonIds,
  lastLessonId: null,
  positionSeconds: null,
});

const renderOutline = (value?: Progress | null) =>
  render(
    <MemoryRouter>
      <CourseOutline courseId="c1" modules={modules} progress={value} />
    </MemoryRouter>,
  );

describe('CourseOutline', () => {
  it('should list the lessons without links before the enrollment', () => {
    renderOutline(null);

    expect(
      screen.getByRole('heading', { name: /1\. Primeiros passos/ }),
    ).toHaveTextContent('2 aulas · 1 h 15 min');
    expect(screen.getByText('Filtrando')).toBeVisible();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('should lead an enrolled student to each lesson and show what is done', () => {
    renderOutline(progress(['l1']));

    expect(
      screen.getByRole('heading', { name: /1\. Primeiros passos/ }),
    ).toHaveTextContent('1 de 2 concluídas');
    const done = screen.getByRole('link', { name: /Instalando/ });
    expect(done).toHaveAttribute('href', '/cursos/c1/aulas/l1');
    expect(within(done).getByRole('img', { name: 'Concluída' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Notebook/ })).toHaveTextContent(
      'Você parou aqui',
    );
  });

  it('should keep the check on a done lesson the student went back to', () => {
    renderOutline({ ...progress(['l1']), lastLessonId: 'l1' });
    const here = screen.getByRole('link', { name: /Instalando/ });

    expect(here).toHaveTextContent('Você parou aqui');
    expect(within(here).getByRole('img', { name: 'Concluída' })).toBeVisible();
  });

  it('should mark no lesson as the stopping point once the course is done', () => {
    renderOutline(progress(['l1', 'l2', 'l3']));

    expect(screen.queryByText('Você parou aqui')).toBeNull();
  });
});
