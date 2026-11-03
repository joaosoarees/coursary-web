import { useMutation, useQueryClient } from '@tanstack/react-query';

import { courseQuery, enrollmentQuery } from '~/queries/course';
import { EnrollmentService } from '~/services/EnrollmentService';

const useRefreshAfter = () => {
  const queryClient = useQueryClient();

  return (courseId: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: enrollmentQuery(courseId).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: courseQuery(courseId).queryKey,
        exact: true,
      }),
    ]);
};

export const useEnroll = () => {
  const refresh = useRefreshAfter();

  return useMutation({
    mutationFn: (courseId: string) => EnrollmentService.enroll(courseId),
    onSuccess: (_, courseId) => refresh(courseId),
  });
};

export const useCancelEnrollment = () => {
  const refresh = useRefreshAfter();

  return useMutation({
    mutationFn: (courseId: string) => EnrollmentService.cancel(courseId),
    onSuccess: (_, courseId) => refresh(courseId),
  });
};
