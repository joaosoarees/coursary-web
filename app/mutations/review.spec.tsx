import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSaveReview } from '~/mutations/review';
import { courseQuery, myReviewQuery } from '~/queries/course';
import { type MyReview, ReviewService } from '~/services/ReviewService';

const saved: MyReview = {
  courseId: 'c1',
  rating: 5,
  comment: 'Ótimo.',
  createdAt: '2026-11-04T12:00:00.000Z',
  updatedAt: '2026-11-04T12:00:00.000Z',
};

describe('useSaveReview', () => {
  it('should keep the saved review and mark the course rating as old', async () => {
    const client = new QueryClient();
    client.setQueryData(myReviewQuery('c1').queryKey, null);
    client.setQueryData(courseQuery('c1').queryKey, {} as never);
    vi.spyOn(ReviewService, 'save').mockResolvedValue(saved);
    const { result } = renderHook(() => useSaveReview('c1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({ rating: 5, comment: 'Ótimo.' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(client.getQueryData(myReviewQuery('c1').queryKey)).toEqual(saved);
    expect(
      client.getQueryState(courseQuery('c1').queryKey)?.isInvalidated,
    ).toBe(true);
  });
});
