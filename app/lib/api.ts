import { ApiError } from '~/lib/apiError';
import { env } from '~/lib/env';
import {
  endSession,
  getAccessToken,
  getSessionGeneration,
  startSession,
} from '~/session/session';

// The API in the deployed build; in development, the Vite proxy in front of it.
const baseUrl = env.DEV ? '/api' : env.VITE_API_URL;

// Only a separate host is worth a preconnect; the development proxy shares the page's origin.
export const apiOrigin: string | undefined = baseUrl.startsWith('http')
  ? new URL(baseUrl).origin
  : undefined;

interface ErrorBody {
  error?: { code?: string };
}

interface Tokens {
  accessToken: string;
  expiresIn: number;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

const send = (
  path: string,
  { method = 'GET', body, signal }: ApiRequestOptions,
  token: string | undefined,
) => {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    signal,
  });
};

let refreshing: Promise<boolean> | undefined;

const renewSession = async () => {
  const generation = getSessionGeneration();
  const response = await send('/auth/refresh', { method: 'POST' }, undefined);

  if (response.status === 401 || response.status === 403) {
    endSession();
    return false;
  }

  if (!response.ok) {
    throw new ApiError(response.status, undefined);
  }

  const { accessToken } = (await response.json()) as Tokens;

  if (generation !== getSessionGeneration()) {
    return false;
  }

  startSession(accessToken);

  return true;
};

export const refreshSession = () => {
  refreshing ??= renewSession().finally(() => {
    refreshing = undefined;
  });

  return refreshing;
};

export const restoreSession = () => refreshSession().catch(() => false);

export async function apiRequest<TBody>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TBody> {
  const token = getAccessToken();
  let response = await send(path, options, token);

  if (response.status === 401 && token !== undefined) {
    const current = getAccessToken();
    const renewed =
      current === token ? await refreshSession() : current !== undefined;

    if (renewed) {
      response = await send(path, options, getAccessToken());
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new ApiError(response.status, body.error?.code);
  }

  if (response.status === 204) {
    return undefined as TBody;
  }

  return (await response.json()) as TBody;
}

export const apiGet = <TBody>(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
) => apiRequest<TBody>(path, { signal });
