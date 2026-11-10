import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BlockBoundary } from '~/components/BlockBoundary';

let broken = true;

function Questions() {
  if (broken) {
    throw new Error('questions.items is undefined');
  }

  return <p>Perguntas da aula</p>;
}

function Page() {
  return (
    <>
      <p>Vídeo da aula</p>
      <Link to="/outra">Próxima aula</Link>
      <BlockBoundary title="Não deu para mostrar as perguntas">
        <Questions />
      </BlockBoundary>
    </>
  );
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/aula']}>
      <Routes>
        <Route path="*" element={<Page />} />
      </Routes>
    </MemoryRouter>,
  );

describe('BlockBoundary', () => {
  beforeEach(() => {
    broken = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should replace only the broken block with its error state', () => {
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não deu para mostrar as perguntas',
    );
    expect(screen.getByText('Vídeo da aula')).toBeInTheDocument();
    expect(screen.queryByText('questions.items is undefined')).toBeNull();
  });

  it('should render the block again on retry', () => {
    renderPage();
    broken = false;

    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(screen.getByText('Perguntas da aula')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should clear the error when the address changes', () => {
    renderPage();
    broken = false;

    fireEvent.click(screen.getByRole('link', { name: 'Próxima aula' }));

    expect(screen.getByText('Perguntas da aula')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
