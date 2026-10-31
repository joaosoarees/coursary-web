import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { endSession, startSession } from '~/session/session';
import { SessionProvider } from '~/session/SessionProvider';
import { useSession } from '~/session/useSession';

function Probe() {
  const { status } = useSession();

  return <p>{status}</p>;
}

afterEach(() => {
  endSession();
});

describe('SessionProvider', () => {
  it('should follow the session as it starts and ends', () => {
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    expect(screen.getByText('signed-out')).toBeInTheDocument();

    act(() => {
      startSession('token-1');
    });
    expect(screen.getByText('signed-in')).toBeInTheDocument();

    act(() => {
      endSession();
    });
    expect(screen.getByText('signed-out')).toBeInTheDocument();
  });

  it('should refuse to be read outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow(
      'Cannot use `useSession` outside `SessionProvider`.',
    );
  });
});
