import { queryOptions, useQuery } from '@tanstack/react-query';

import { AccountService } from '~/services/AccountService';

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => AccountService.getMe(signal),
});

export const useMe = () => useQuery(meQuery);
