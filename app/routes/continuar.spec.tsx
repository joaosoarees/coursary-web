import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '~/lib/queryClient';
import ContinueRoute, { clientLoader } from '~/routes/continuar';
import { AuthService } from '~/services/AuthService';
import { EnrollmentService } from '~/services/EnrollmentService';
import { LessonService } from '~/services/LessonService';
import { endSession, startSession } from '~/session/session';
import { apiError, Landing, renderRoutes } from '~/test/renderRoutes';

beforeEach(() => {
  startSession('token-1');
  vi.spyOn(LessonService, 'outline').mockResolvedValue({
    courseId: 'c1',
    title: 'Curso',
    status: 'PUBLISHED',
    modules: [
      {
        id: 'm1',
        title: 'Um',
        position: 0,
        lessons: [
          { id: 'l1', title: 'Primeira', durationMinutes: 5, position: 0 },
          { id: 'l2', title: 'Segunda', durationMinutes: 5, position: 1 },
        ],
      },
    ],
  });
});

afterEach(() => {
  endSession();
  queryClient.clear();
});

const renderContinue = () =>
  renderRoutes(
    [
      {
        path: '/cursos/:id/continuar',
        Component: ContinueRoute,
        loader: clientLoader as never,
      },
      {
        path: '/cursos/:id/aulas/:aulaId',
        Component: () => <Landing title="Aula" />,
      },
      { path: '/cursos/:id', Component: () => <Landing title="Curso" /> },
    ],
    '/cursos/c1/continuar',
  );

describe('/cursos/:id/continuar', () => {
  it('should open the lesson to resume', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue({
      completedLessons: 1,
      completedLessonIds: ['l1'],
      lastLessonId: null,
      positionSeconds: null,
    });
    renderContinue();

    expect(await screen.findByRole('heading', { name: 'Aula' })).toBeVisible();
  });

  it('should wait for the session on a cold load and still open the lesson', async () => {
    endSession();
    vi.spyOn(AuthService, 'refresh').mockResolvedValue({
      accessToken: 'token-2',
      expiresIn: 900,
    });
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue({
      completedLessons: 0,
      completedLessonIds: [],
      lastLessonId: null,
      positionSeconds: null,
    });
    renderContinue();

    expect(await screen.findByRole('heading', { name: 'Aula' })).toBeVisible();
  });

  it('should send someone without an enrollment to the course page', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockResolvedValue(null);
    renderContinue();

    expect(await screen.findByRole('heading', { name: 'Curso' })).toBeVisible();
  });

  it('should send a failure to the course page', async () => {
    vi.spyOn(EnrollmentService, 'progress').mockRejectedValue(
      apiError(404, 'COURSE_NOT_FOUND'),
    );
    renderContinue();

    expect(await screen.findByRole('heading', { name: 'Curso' })).toBeVisible();
  });
});
