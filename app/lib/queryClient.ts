import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

const MAX_RETRIES = 3;

const comesBackTheSame = (error: Error) =>
  error instanceof ZodError ||
  (isAxiosError(error) &&
    error.response !== undefined &&
    error.response.status < 500);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && !comesBackTheSame(error),
    },
  },
});
