import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type AxiosAdapter,
  AxiosError,
  type AxiosResponse,
  CanceledError,
} from 'axios';
import { createContext, use, useState } from 'react';
import { createRoutesStub, Link, useLocation } from 'react-router';
import { action } from 'storybook/actions';

import { httpClient } from '~/services/httpClient';

export type ApiReply = { status?: number; body?: unknown } | 'pending';

// Keyed by method and path (`'GET /me/notifications'`): query parameters do not count.
export type ApiRoutes = Record<string, ApiReply>;

const logRequest = action('api');

const respond = (
  reply: { status?: number; body?: unknown },
  config: Parameters<AxiosAdapter>[0],
): Promise<AxiosResponse> => {
  const status = reply.status ?? 200;
  const response: AxiosResponse = {
    data: reply.body,
    status,
    statusText: '',
    headers: {},
    config,
  };

  if (status < 400) {
    return Promise.resolve(response);
  }

  return Promise.reject(
    new AxiosError(
      `Request failed with status code ${String(status)}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      response,
    ),
  );
};

const adapterFor =
  (routes: ApiRoutes): AxiosAdapter =>
  (config) => {
    const route = `${(config.method ?? 'get').toUpperCase()} ${config.url ?? ''}`;
    const reply = routes[route];

    logRequest(route, config.params, config.data);

    if (reply === undefined) {
      console.error(`No reply in parameters.api for ${route}`);

      return respond(
        {
          status: 404,
          body: { error: { code: 'NOT_FOUND', message: route } },
        },
        config,
      );
    }

    if (reply === 'pending') {
      return new Promise((_, reject) => {
        config.signal?.addEventListener?.('abort', () => {
          reject(new CanceledError(undefined, undefined, config));
        });
      });
    }

    return respond(reply, config);
  };

function QueryCache({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export const withApi: Decorator = (Story, { parameters }) => {
  // The services share one httpClient: a docs page that drew two of these stories in one document
  // would answer both with the routes of the last, so their metas set docs.story.inline to false.
  httpClient.defaults.adapter = adapterFor((parameters.api ?? {}) as ApiRoutes);

  return (
    <QueryCache>
      <Story />
    </QueryCache>
  );
};

function Elsewhere() {
  const { pathname, hash } = useLocation();

  return (
    <p className="flex flex-col items-center gap-2 text-center">
      <span>
        O link leva a <code>{pathname + hash}</code>.
      </span>
      <Link to="/" className="font-bold text-link underline">
        Voltar à história
      </Link>
    </p>
  );
}

// One stub for every story, which it reads from context: a stub made on each render would remount
// the story, and lose where it navigated, whenever a control or the theme changed.
const StoryContext = createContext<React.ReactNode>(null);

function CurrentStory() {
  return use(StoryContext);
}

const RoutesStub = createRoutesStub([
  { path: '/', Component: CurrentStory },
  { path: '*', Component: Elsewhere },
]);

export const withRouter: Decorator = (Story) => (
  <StoryContext value={<Story />}>
    <RoutesStub initialEntries={['/']} />
  </StoryContext>
);
