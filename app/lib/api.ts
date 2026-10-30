// The API in the deployed build; in development, the Vite proxy in front of it (Q494).
const baseUrl: string = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL as string);

// An answer outside 2xx, with the API's error code when it sent one.
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

// Every call carries the session cookie (Q467).
export async function apiGet<TBody>(path: string): Promise<TBody> {
  const response = await fetch(`${baseUrl}${path}`, { credentials: 'include' });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new ApiError(response.status, body.error?.code);
  }

  return (await response.json()) as TBody;
}
