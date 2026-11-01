import { queryOptions, useQuery } from '@tanstack/react-query';

import { HealthService } from '~/services/HealthService';

export const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: ({ signal }) => HealthService.get(signal),
});

export const useHealth = () => useQuery(healthQuery);
