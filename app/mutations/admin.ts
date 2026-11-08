import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type AccountRole, AdminService } from '~/services/AdminService';

// Every admin list, search and history lives under this key. Refetched after a refusal too: the
// API refuses mostly because the account changed elsewhere.
const ADMIN_ACCOUNTS = ['admin', 'accounts'];

export const useChangeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      role,
    }: {
      accountId: string;
      role: AccountRole;
    }) => AdminService.changeRole(accountId, role),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_ACCOUNTS }),
  });
};

export const useChangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      enable,
    }: {
      accountId: string;
      enable: boolean;
    }) =>
      enable ? AdminService.enable(accountId) : AdminService.disable(accountId),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_ACCOUNTS }),
  });
};
