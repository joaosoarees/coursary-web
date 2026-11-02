import { useMutation, useQueryClient } from '@tanstack/react-query';

import { meQuery } from '~/queries/me';
import { AccountService } from '~/services/AccountService';

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => AccountService.updateMe(name),
    onSuccess: (profile) => {
      queryClient.setQueryData(meQuery.queryKey, profile);
    },
  });
};
