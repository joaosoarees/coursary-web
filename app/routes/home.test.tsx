import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './home';

const renderHome = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <Home />
    </QueryClientProvider>,
  );
};

describe('Home', () => {
  it('should say the API is up when /health answers', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ status: 'ok' }));

    renderHome();

    expect(await screen.findByText('A API está no ar.')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/health$/), {
      credentials: 'include',
    });
  });

  it('should say the API did not answer when /health fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json(
        { error: { code: 'INTERNAL_SERVER_ERROR' } },
        { status: 500 },
      ),
    );

    renderHome();

    expect(await screen.findByText('A API não respondeu.')).toBeInTheDocument();
  });
});
