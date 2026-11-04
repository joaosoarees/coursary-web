import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSavePosition } from '~/mutations/progress';
import { enrollmentQuery } from '~/queries/course';
import { EnrollmentService, type Progress } from '~/services/EnrollmentService';

const setUp = () => {
  const client = new QueryClient();
  const progress: Progress = {
    completedLessons: 0,
    completedLessonIds: [],
    lastLessonId: 'l1',
    positionSeconds: 30,
  };
  client.setQueryData(enrollmentQuery('c1').queryKey, progress);
  const save = vi.spyOn(EnrollmentService, 'savePosition').mockResolvedValue();
  const { result } = renderHook(() => useSavePosition('c1', 'l2'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  return { client, save, savePosition: result.current };
};

describe('useSavePosition', () => {
  it('should record a new last lesson in the cached progress and send the position', () => {
    const { client, save, savePosition } = setUp();

    savePosition(12);

    expect(client.getQueryData(enrollmentQuery('c1').queryKey)).toMatchObject({
      lastLessonId: 'l2',
      positionSeconds: 12,
    });
    expect(save).toHaveBeenCalledWith(
      { courseId: 'c1', lessonId: 'l2', positionSeconds: 12 },
      { leaving: false },
    );
  });

  it('should leave the cached progress alone while the same lesson plays on', () => {
    const { client, savePosition } = setUp();
    savePosition(12);
    const cached = client.getQueryData(enrollmentQuery('c1').queryKey);

    savePosition(32, true);

    expect(client.getQueryData(enrollmentQuery('c1').queryKey)).toBe(cached);
    expect(
      client.getQueryState(enrollmentQuery('c1').queryKey)?.isInvalidated,
    ).toBe(true);
  });
});
