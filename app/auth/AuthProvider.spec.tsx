import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import { useAuth } from '~/auth/useAuth';
import { endSession, startSession } from '~/session/session';

function Probe() {
  const { signedIn } = useAuth();

  return <p>{signedIn ? 'signed-in' : 'signed-out'}</p>;
}

afterEach(() => {
  endSession();
});

describe('AuthProvider', () => {
  it('should follow the session as it starts and ends', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
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
      'Cannot use `useAuth` outside `AuthProvider`.',
    );
  });
});
