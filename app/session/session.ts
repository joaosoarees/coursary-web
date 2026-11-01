import { queryClient } from '~/lib/queryClient';

export type SessionStatus = 'signed-in' | 'signed-out';

let accessToken: string | undefined;
let generation = 0;

const listeners = new Set<() => void>();

const channel =
  typeof BroadcastChannel === 'undefined'
    ? undefined
    : new BroadcastChannel('coursary:session');

const notify = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

export const getAccessToken = () => accessToken;

export const getSessionGeneration = () => generation;

export const isSignedIn = () => accessToken !== undefined;

export const getSessionStatus = (): SessionStatus =>
  accessToken === undefined ? 'signed-out' : 'signed-in';

export const startSession = (token: string) => {
  accessToken = token;
  notify();
};

const forget = () => {
  accessToken = undefined;
  generation += 1;
  queryClient.clear();
  notify();
};

export const endSession = () => {
  if (accessToken === undefined) {
    return;
  }

  forget();
  channel?.postMessage('signed-out');
};

channel?.addEventListener('message', () => {
  if (accessToken !== undefined) {
    forget();
  }
});

export const subscribeToSession = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
