import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorState } from '~/components/ErrorState';

describe('ErrorState', () => {
  it('should offer a retry and the way home on a page', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Algo deu errado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para o início' }),
    ).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should stay inside its block, without a page heading or the way home', () => {
    render(<ErrorState variant="block" title="O vídeo não carregou" />);

    expect(screen.getByText('O vídeo não carregou')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
