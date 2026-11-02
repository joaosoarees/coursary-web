import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PasswordInput } from '~/components/visitor/PasswordInput';

describe('PasswordInput', () => {
  it('should show and hide the password', () => {
    render(<PasswordInput aria-label="Senha" defaultValue="violao2026" />);
    const input = screen.getByLabelText('Senha');
    const toggle = screen.getByRole('button', { name: 'Mostrar senha' });

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should not submit the form it sits in', () => {
    const onSubmit = vi.fn((event: React.SubmitEvent) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput aria-label="Senha" />
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
