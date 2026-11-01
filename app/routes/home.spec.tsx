import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { HealthService } from '~/services/HealthService';

import Home from './home';

let getHealth: MockInstance<typeof HealthService.get>;

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
  getHealth = vi.spyOn(HealthService, 'get');
  getHealth.mockResolvedValue({ status: 'ok' });
});

describe('Home', () => {
  it('should ask /health once, with the query signal', async () => {
    renderHome();

    await screen.findByText('A API está no ar.');
    expect(getHealth).toHaveBeenCalledOnce();
    expect(getHealth).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('should say the API is up when /health answers', async () => {
    renderHome();

    expect(await screen.findByText('A API está no ar.')).toBeInTheDocument();
  });

  it('should say the API did not answer when /health fails', async () => {
    getHealth.mockRejectedValue(new AxiosError('failed', 'ERR_BAD_RESPONSE'));

    renderHome();

    expect(await screen.findByText('A API não respondeu.')).toBeInTheDocument();
  });
});
