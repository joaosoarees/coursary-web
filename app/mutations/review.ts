import { useMutation, useQueryClient } from '@tanstack/react-query';

import { courseQuery, myReviewQuery, reviewsQuery } from '~/queries/course';
import { ReviewService } from '~/services/ReviewService';

export const useSaveReview = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      ReviewService.save({ courseId, rating, comment }),
    onSuccess: (review) => {
      queryClient.setQueryData(myReviewQuery(courseId).queryKey, review);
      void queryClient.invalidateQueries({
        queryKey: courseQuery(courseId).queryKey,
        exact: true,
      });
      void queryClient.invalidateQueries({
        queryKey: reviewsQuery(courseId).queryKey,
      });
      // The catalog and the search show the average too; they refetch when next shown.
      void queryClient.invalidateQueries({
        queryKey: ['courses'],
        refetchType: 'none',
      });
    },
  });
};
