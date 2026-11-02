import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '~/components/ui/button';

describe('Button', () => {
  it('should not submit a form unless asked to', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('should keep the type it is given', () => {
    render(<Button type="submit">Entrar</Button>);

    expect(screen.getByRole('button', { name: 'Entrar' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('should not put a type on the element it wraps', () => {
    render(
      <Button asChild>
        <a href="/cursos">Ver cursos</a>
      </Button>,
    );

    expect(
      screen.getByRole('link', { name: 'Ver cursos' }),
    ).not.toHaveAttribute('type');
  });
});
