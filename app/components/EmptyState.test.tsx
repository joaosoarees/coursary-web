import { render, screen } from '@testing-library/react';
import { BookOpen } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '~/components/EmptyState';

describe('EmptyState', () => {
  it('should say what is missing and offer the way forward', () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="Nenhum curso ainda"
        description="Crie o primeiro para começar."
        action={<button type="button">Novo curso</button>}
      />,
    );

    expect(screen.getByText('Nenhum curso ainda')).toBeInTheDocument();
    expect(
      screen.getByText('Crie o primeiro para começar.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Novo curso' }),
    ).toBeInTheDocument();
  });
});
