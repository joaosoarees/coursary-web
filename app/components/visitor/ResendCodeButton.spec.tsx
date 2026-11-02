import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResendCodeButton } from '~/components/visitor/ResendCodeButton';
import { useCooldown } from '~/components/visitor/useCooldown';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function Resend() {
  const { remaining, start } = useCooldown(60);

  return (
    <ResendCodeButton remaining={remaining} pending={false} onResend={start} />
  );
}

describe('ResendCodeButton', () => {
  it('should wait 60 seconds before it can resend again', () => {
    render(<Resend />);

    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }));
    expect(screen.getByText('Reenviar em 1:00')).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(13_000);
    });
    expect(screen.getByText('Reenviar em 0:47')).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(47_000);
    });
    expect(
      screen.getByRole('button', { name: 'Reenviar código' }),
    ).toBeEnabled();
  });

  it('should be disabled while the code is being sent', () => {
    render(<ResendCodeButton remaining={0} pending onResend={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Reenviando…' })).toBeDisabled();
  });
});
