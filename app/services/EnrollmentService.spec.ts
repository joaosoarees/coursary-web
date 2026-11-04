import type { AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EnrollmentService } from '~/services/EnrollmentService';
import { httpClient } from '~/services/httpClient';
import { apiError } from '~/test/renderRoutes';

const adapter = vi.fn<AxiosAdapter>();
const defaultAdapter = httpClient.defaults.adapter;

beforeEach(() => {
  httpClient.defaults.adapter = adapter;
});

afterEach(() => {
  httpClient.defaults.adapter = defaultAdapter;
});

const answer = (data: unknown, status = 200) =>
  adapter.mockImplementationOnce((config) =>
    Promise.resolve({ data, status, statusText: '', headers: {}, config }),
  );

describe('EnrollmentService.progress', () => {
  it('should read the progress of an enrolled course', async () => {
    const progress = {
      completedLessons: 3,
      completedLessonIds: ['l1', 'l2', 'l3'],
      lastLessonId: 'l3',
      positionSeconds: 42,
    };
    answer(progress);

    await expect(EnrollmentService.progress('c1')).resolves.toEqual(progress);
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/courses/c1/progress',
    });
  });

  it('should read a refusal as no enrollment', async () => {
    adapter.mockRejectedValueOnce(apiError(403, 'FORBIDDEN'));

    await expect(EnrollmentService.progress('c1')).resolves.toBeNull();
  });

  it('should let any other failure through', async () => {
    adapter.mockRejectedValueOnce(apiError(404, 'COURSE_NOT_FOUND'));

    await expect(EnrollmentService.progress('c1')).rejects.toThrow();
  });
});

describe('EnrollmentService enroll and cancel', () => {
  it('should put and delete the enrollment of the course', async () => {
    answer({}, 201);
    answer(undefined, 204);

    await EnrollmentService.enroll('c1');
    await EnrollmentService.cancel('c1');

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      method: 'put',
      url: '/courses/c1/enrollment',
    });
    expect(adapter.mock.calls[1]?.[0]).toMatchObject({
      method: 'delete',
      url: '/courses/c1/enrollment',
    });
  });
});

describe('EnrollmentService.listMine', () => {
  it('should ask for a page of the caller enrollments by cursor', async () => {
    const enrollment = {
      courseId: 'c1',
      title: 'Python para análise de dados',
      instructorName: 'Juliana Prado',
      lessonCount: 42,
      completedLessons: 10,
      enrolledAt: '2026-10-01T00:00:00.000Z',
      courseStatus: 'ARCHIVED',
    };
    answer({ items: [enrollment], nextCursor: 'next' });

    await expect(
      EnrollmentService.listMine({ cursor: 'abc', limit: 12 }),
    ).resolves.toEqual({ items: [enrollment], nextCursor: 'next' });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      url: '/me/enrollments',
      params: { cursor: 'abc', limit: 12 },
    });
  });
});

describe('EnrollmentService.completeLesson', () => {
  it('should complete one lesson of the course', async () => {
    answer({ lessonId: 'l1', completedLessons: 3 });

    await expect(
      EnrollmentService.completeLesson({ courseId: 'c1', lessonId: 'l1' }),
    ).resolves.toEqual({ lessonId: 'l1', completedLessons: 3 });
    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      method: 'put',
      url: '/courses/c1/lessons/l1/completion',
    });
  });
});

describe('EnrollmentService.savePosition', () => {
  it('should save whole seconds of the lesson being watched', async () => {
    answer(undefined, 204);

    await EnrollmentService.savePosition({
      courseId: 'c1',
      lessonId: 'l1',
      positionSeconds: 42.7,
    });

    const config = adapter.mock.calls[0]?.[0];
    expect(config).toMatchObject({
      method: 'put',
      url: '/courses/c1/position',
    });
    expect(JSON.parse(String(config?.data))).toEqual({
      lessonId: 'l1',
      positionSeconds: 42,
    });
  });

  it('should send a request that outlives the page when leaving', async () => {
    // The fetch adapter cannot run in jsdom; what matters is that the call asks for it.
    const put = vi.spyOn(httpClient, 'put').mockResolvedValue({});

    await EnrollmentService.savePosition(
      { courseId: 'c1', lessonId: 'l1', positionSeconds: 5 },
      { leaving: true },
    );

    expect(put).toHaveBeenCalledWith(
      '/courses/c1/position',
      { lessonId: 'l1', positionSeconds: 5 },
      { adapter: 'fetch', fetchOptions: { keepalive: true } },
    );
  });
});
