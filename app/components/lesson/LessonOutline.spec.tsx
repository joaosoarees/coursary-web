import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';

import { LessonOutline } from '~/components/lesson/LessonOutline';
import type { CourseModule } from '~/services/CourseService';

const modules: CourseModule[] = [
  {
    id: 'm1',
    title: 'Primeiros passos',
    position: 0,
    lessons: [
      {
        id: 'l1',
        title: 'Instalando o ambiente',
        durationMinutes: 12,
        position: 0,
      },
      {
        id: 'l2',
        title: 'Seu primeiro notebook',
        durationMinutes: 15,
        position: 1,
      },
    ],
  },
  {
    id: 'm2',
    title: 'Pandas na prática',
    position: 1,
    lessons: [
      { id: 'l3', title: 'Lendo planilhas', durationMinutes: 14, position: 0 },
    ],
  },
];

const renderOutline = () => {
  const Stub = createRoutesStub([
    {
      path: '/cursos/:id/aulas/:aulaId',
      Component: () => (
        <LessonOutline
          courseId="c1"
          modules={modules}
          currentLessonId="l2"
          completedLessonIds={['l1', 'gone']}
        />
      ),
    },
  ]);

  return render(<Stub initialEntries={['/cursos/c1/aulas/l2']} />);
};

describe('LessonOutline', () => {
  it('should link every lesson and mark the current one and the finished ones', () => {
    renderOutline();

    const current = screen.getByRole('link', { name: /Seu primeiro notebook/ });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('href', '/cursos/c1/aulas/l2');
    expect(
      within(
        screen.getByRole('link', { name: /Instalando o ambiente/ }),
      ).getByRole('img', { name: 'Concluída' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Lendo planilhas/ })).toBeNull();
  });

  it('should open only the current module and open the others on a click', () => {
    renderOutline();
    const other = screen.getByRole('button', { name: /2\. Pandas na prática/ });

    expect(
      screen.getByRole('button', { name: /1\. Primeiros passos/ }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(other).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(other);

    expect(other).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: /Lendo planilhas/ }),
    ).not.toHaveAttribute('aria-current');
    expect(
      screen.getByRole('link', { name: /Seu primeiro notebook/ }),
    ).toBeInTheDocument();
  });

  it('should count only the lessons still in the course', () => {
    renderOutline();

    expect(screen.getAllByText('1 de 3 aulas')[0]).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Primeiros passos/ }),
    ).toHaveTextContent('1 de 2 concluídas');
    expect(screen.getByText('0 de 1')).toBeInTheDocument();
  });

  it('should open and close the list on a phone', () => {
    renderOutline();
    const toggle = screen.getByRole('button', { name: /Conteúdo do curso/ });

    expect(
      screen.getAllByRole('heading', { level: 2, name: 'Conteúdo do curso' }),
    ).not.toHaveLength(0);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('should show a preview with no progress and its own lesson links', () => {
    const Stub = createRoutesStub([
      {
        path: '/instrutor/cursos/:id/aulas/:aulaId/previa',
        Component: () => (
          <LessonOutline
            courseId="c1"
            modules={modules}
            currentLessonId="l2"
            completedLessonIds={[]}
            preview
            lessonPath={(id) => `/instrutor/cursos/c1/aulas/${id}/previa`}
          />
        ),
      },
    ]);
    render(<Stub initialEntries={['/instrutor/cursos/c1/aulas/l2/previa']} />);

    expect(
      screen.getByRole('link', { name: /Seu primeiro notebook/ }),
    ).toHaveAttribute('href', '/instrutor/cursos/c1/aulas/l2/previa');
    expect(
      screen.getByRole('button', { name: /1\. Primeiros passos/ }),
    ).toHaveTextContent('2 aulas');
    expect(screen.getByText('3 aulas · 2 módulos')).toBeInTheDocument();
    expect(screen.queryByText(/concluídas/)).toBeNull();
  });

  it('should show an empty module in a preview as a heading that does not open', () => {
    const Stub = createRoutesStub([
      {
        path: '/previa',
        Component: () => (
          <LessonOutline
            courseId="c1"
            modules={[
              ...modules,
              { id: 'm3', title: 'Em breve', position: 2, lessons: [] },
            ]}
            currentLessonId="l2"
            completedLessonIds={[]}
            preview
          />
        ),
      },
    ]);
    render(<Stub initialEntries={['/previa']} />);

    expect(
      screen.getByRole('heading', { level: 3, name: /3\. Em breve/ }),
    ).toHaveTextContent('0 aulas');
    expect(screen.queryByRole('button', { name: /Em breve/ })).toBeNull();
  });
});
