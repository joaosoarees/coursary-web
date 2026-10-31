import { env } from '~/lib/env';

// The API in the deployed build; in development, the Vite proxy in front of it.
const baseUrl = env.DEV ? '/api' : env.VITE_API_URL;

// Only a separate host is worth a preconnect; the development proxy shares the page's origin.
export const apiOrigin: string | undefined = baseUrl.startsWith('http')
  ? new URL(baseUrl).origin
  : undefined;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
  ) {
    super(code ?? `HTTP ${String(status)}`);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { code?: string };
}

export async function apiGet<TBody>(
  path: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<TBody> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new ApiError(response.status, body.error?.code);
  }

  return (await response.json()) as TBody;
}
