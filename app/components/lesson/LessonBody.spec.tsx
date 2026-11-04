import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LessonBody } from '~/components/lesson/LessonBody';

describe('LessonBody', () => {
  it('should start the headings below the page title', () => {
    render(<LessonBody markdown={'# Instale o Python\n\n## No Windows'} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Instale o Python' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'No Windows' }),
    ).toBeInTheDocument();
  });

  it('should open a link to another site in a new tab and say so', () => {
    render(
      <LessonBody markdown="Veja a [documentação](https://pandas.test)." />,
    );
    const link = screen.getByRole('link', { name: /^documentação/ });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('documentação (abre em nova aba)');
  });

  it('should keep an anchor and a page of the app in the same tab', () => {
    render(
      <LessonBody
        markdown={`[acima](#passo-1) e [o catálogo](${window.location.origin}/cursos)`}
      />,
    );

    expect(screen.getByRole('link', { name: 'acima' })).not.toHaveAttribute(
      'target',
    );
    expect(
      screen.getByRole('link', { name: 'o catálogo' }),
    ).not.toHaveAttribute('target');
  });

  it('should keep every heading level below the one above it', () => {
    render(<LessonBody markdown={'### Passo\n\n#### Detalhe'} />);

    expect(
      screen.getByRole('heading', { level: 4, name: 'Passo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 5, name: 'Detalhe' }),
    ).toBeInTheDocument();
  });

  it('should show HTML in the body as text, never as markup', () => {
    const { container } = render(
      <LessonBody markdown={'<img src=x onerror="alert(1)">\n\nTexto'} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });

  it('should drop a javascript address from a link', () => {
    render(<LessonBody markdown="[clique](javascript:alert(1))" />);

    expect(screen.getByText('clique')).toHaveAttribute('href', '');
  });
});
