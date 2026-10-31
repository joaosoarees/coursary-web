import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '~/lib/queryClient';
import {
  endSession,
  getAccessToken,
  getSessionGeneration,
  getSessionStatus,
  startSession,
  subscribeToSession,
} from '~/session/session';

afterEach(() => {
  endSession();
});

describe('session', () => {
  it('should start signed out', () => {
    expect(getSessionStatus()).toBe('signed-out');
    expect(getAccessToken()).toBeUndefined();
  });

  it('should hold the access token while signed in', () => {
    startSession('token-1');

    expect(getSessionStatus()).toBe('signed-in');
    expect(getAccessToken()).toBe('token-1');
  });

  it('should tell its subscribers when it starts and ends', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSession(listener);

    startSession('token-1');
    endSession();
    unsubscribe();
    startSession('token-2');

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should forget the account's cached data when it ends", () => {
    queryClient.setQueryData(['me'], { name: 'Ada' });
    startSession('token-1');

    endSession();

    expect(queryClient.getQueryData(['me'])).toBeUndefined();
  });

  it('should change its generation every time it ends', () => {
    const before = getSessionGeneration();
    startSession('token-1');

    endSession();

    expect(getSessionGeneration()).toBe(before + 1);
  });

  it('should do nothing when ending a session that is not there', () => {
    const listener = vi.fn();
    subscribeToSession(listener);
    queryClient.setQueryData(['health'], { status: 'ok' });

    endSession();

    expect(listener).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(['health'])).toEqual({ status: 'ok' });
  });
});
