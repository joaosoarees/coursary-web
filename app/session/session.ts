import { queryClient } from '~/lib/queryClient';

export type SessionStatus = 'signed-in' | 'signed-out';

let accessToken: string | undefined;

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

export const getAccessToken = () => accessToken;

export const getSessionStatus = (): SessionStatus =>
  accessToken === undefined ? 'signed-out' : 'signed-in';

export const startSession = (token: string) => {
  accessToken = token;
  notify();
};

export const endSession = () => {
  if (accessToken === undefined) {
    return;
  }

  accessToken = undefined;
  queryClient.clear();
  notify();
};

export const subscribeToSession = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
