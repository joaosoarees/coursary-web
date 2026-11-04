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

  it('should open links in a new tab without handing over the page', () => {
    render(
      <LessonBody markdown="Veja a [documentação](https://pandas.test)." />,
    );

    expect(screen.getByRole('link', { name: 'documentação' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'documentação' })).toHaveAttribute(
      'target',
      '_blank',
    );
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
