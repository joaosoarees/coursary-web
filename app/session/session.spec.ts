import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from '~/lib/queryClient';
import {
  endSession,
  getAccessToken,
  getSessionGeneration,
  getSessionStatus,
  isSignedIn,
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

    expect(isSignedIn()).toBe(true);
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

  it('should tell the other tabs when it ends', async () => {
    const otherTab = new BroadcastChannel('coursary:session');
    const received = new Promise((resolve) => {
      otherTab.addEventListener('message', (event) => {
        resolve(event.data);
      });
    });
    startSession('token-1');

    endSession();

    await expect(received).resolves.toBe('signed-out');
    otherTab.close();
  });

  it('should end when another tab signs out', async () => {
    const otherTab = new BroadcastChannel('coursary:session');
    startSession('token-1');
    const ended = new Promise<void>((resolve) => {
      const unsubscribe = subscribeToSession(() => {
        unsubscribe();
        resolve();
      });
    });

    otherTab.postMessage('signed-out');
    await ended;

    expect(isSignedIn()).toBe(false);
    otherTab.close();
  });
});
