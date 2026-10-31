import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '~/lib/apiError';

const MAX_RETRIES = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES &&
        !(error instanceof ApiError && error.status < 500),
    },
  },
});
