import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiGet } from '~/lib/api';

import Home from './home';

vi.mock('~/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/lib/api')>()),
  apiGet: vi.fn(),
}));

const apiGetMock = vi.mocked(apiGet);

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

beforeEach(() => {
  apiGetMock.mockResolvedValue({ status: 'ok' });
});

describe('Home', () => {
  it('should ask /health once, with the query signal', async () => {
    renderHome();

    await screen.findByText('A API está no ar.');
    expect(apiGetMock).toHaveBeenCalledOnce();
    expect(apiGetMock).toHaveBeenCalledWith('/health', {
      signal: expect.any(AbortSignal) as AbortSignal,
    });
  });

  it('should say the API is up when /health answers', async () => {
    renderHome();

    expect(await screen.findByText('A API está no ar.')).toBeInTheDocument();
  });

  it('should say the API did not answer when /health fails', async () => {
    apiGetMock.mockRejectedValue(new ApiError(500, 'INTERNAL_SERVER_ERROR'));

    renderHome();

    expect(await screen.findByText('A API não respondeu.')).toBeInTheDocument();
  });
});
