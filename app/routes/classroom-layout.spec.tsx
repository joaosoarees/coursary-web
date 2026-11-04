import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ClassroomLayout from '~/routes/classroom-layout';
import { LessonService } from '~/services/LessonService';
import { endSession, startSession } from '~/session/session';
import { renderRoutes } from '~/test/renderRoutes';

const outline = (status: string) => ({
  courseId: 'c1',
  title: 'DynamoDB na prática',
  status,
  modules: [],
});

beforeEach(() => {
  startSession('token-1');
});

afterEach(() => {
  endSession();
});

const renderClassroom = () =>
  renderRoutes(
    [
      {
        Component: ClassroomLayout,
        children: [
          { path: '/cursos/:id/aulas/:aulaId', Component: () => <h1>Aula</h1> },
        ],
      },
    ],
    '/cursos/c1/aulas/l1',
  );

describe('the classroom', () => {
  it('should show the course and lead out to its page, without the app rail', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue(outline('PUBLISHED'));
    renderClassroom();

    expect(await screen.findByText('DynamoDB na prática')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Sair da aula' })).toHaveAttribute(
      'href',
      '/cursos/c1',
    );
    expect(
      screen.getByRole('link', { name: 'Pular para o conteúdo' }),
    ).toHaveAttribute('href', '#conteudo');
    expect(screen.queryByRole('navigation', { name: 'Principal' })).toBeNull();
  });

  it('should lead out of an archived course to the enrollments', async () => {
    vi.spyOn(LessonService, 'outline').mockResolvedValue(outline('ARCHIVED'));
    renderClassroom();

    await screen.findByText('DynamoDB na prática');
    expect(screen.getByRole('link', { name: 'Sair da aula' })).toHaveAttribute(
      'href',
      '/minhas-matriculas',
    );
  });
});
