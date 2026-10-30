import { queryOptions, useQuery } from '@tanstack/react-query';

import { apiGet } from '~/lib/api';

interface Health {
  status: 'ok';
}

export const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: ({ signal }) => apiGet<Health>('/health', { signal }),
});

export const useHealth = () => useQuery(healthQuery);
