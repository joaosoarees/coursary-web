import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '~/auth/AuthProvider';
import { useAuth } from '~/auth/useAuth';
import { AuthService } from '~/services/AuthService';
import { endSession, getAccessToken, startSession } from '~/session/session';

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

  it('should start the session with the token sign-in returns', async () => {
    vi.spyOn(AuthService, 'signIn').mockResolvedValue({
      accessToken: 'token-1',
      expiresIn: 3600,
    });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() =>
      result.current.signIn({ email: 'ana@exemplo.com', password: 'x' }),
    );

    expect(result.current.signedIn).toBe(true);
    expect(getAccessToken()).toBe('token-1');
  });

  it('should stay signed out when sign-in is refused', async () => {
    vi.spyOn(AuthService, 'signIn').mockRejectedValue(new Error('401'));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await expect(
      result.current.signIn({ email: 'ana@exemplo.com', password: 'x' }),
    ).rejects.toThrow('401');
    expect(result.current.signedIn).toBe(false);
  });

  it('should end the session even when sign-out cannot reach the API', async () => {
    vi.spyOn(AuthService, 'signOut').mockRejectedValue(
      new Error('Network Error'),
    );
    startSession('token-1');
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(() => result.current.signOut());

    expect(result.current.signedIn).toBe(false);
  });

  it('should refuse to be read outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow(
      'Cannot use `useAuth` outside `AuthProvider`.',
    );
  });
});
