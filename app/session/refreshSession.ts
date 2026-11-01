import { isAxiosError } from 'axios';

import { AuthService } from '~/services/AuthService';
import {
  endSession,
  getSessionGeneration,
  startSession,
} from '~/session/session';

const REFUSED_STATUSES = new Set([400, 401, 403]);

let refreshing: Promise<void> | undefined;

// Every tab sends the same refresh cookie and Cognito rotates it on use: two tabs refreshing at
// once would spend it twice, and the second one would be refused.
const acrossTabs = <T>(task: () => Promise<T>) =>
  'locks' in navigator
    ? navigator.locks.request('coursary:refresh', task)
    : task();

const renew = async () => {
  const generation = getSessionGeneration();

  try {
    const { accessToken } = await acrossTabs(() => AuthService.refresh());

    if (generation !== getSessionGeneration()) {
      throw new Error('The session ended during the refresh.');
    }

    startSession(accessToken);
  } catch (error) {
    if (
      isAxiosError(error) &&
      REFUSED_STATUSES.has(error.response?.status ?? 0)
    ) {
      endSession();
    }

    throw error;
  }
};

export const refreshSession = () => {
  refreshing ??= renew().finally(() => {
    refreshing = undefined;
  });

  return refreshing;
};

export const restoreSession = () =>
  refreshSession().then(
    () => true,
    () => false,
  );
