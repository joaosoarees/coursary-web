import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationsKey } from '~/queries/notifications';
import { NotificationService } from '~/services/NotificationService';

const useReloadInbox = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: notificationsKey });
};

export const useMarkNotificationRead = () => {
  const reload = useReloadInbox();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markRead(id),
    onSuccess: reload,
  });
};

export const useMarkAllNotificationsRead = () => {
  const reload = useReloadInbox();

  return useMutation({
    mutationFn: () => NotificationService.markAllRead(),
    onSuccess: reload,
  });
};
