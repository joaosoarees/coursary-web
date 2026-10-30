import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from '~/components/PageHeader';

describe('PageHeader', () => {
  it('should title the page and hold its actions', () => {
    render(
      <PageHeader
        title="Meus cursos"
        description="Rascunhos, publicados e arquivados."
        actions={<button type="button">Novo curso</button>}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Meus cursos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Rascunhos, publicados e arquivados.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Novo curso' }),
    ).toBeInTheDocument();
  });
});
