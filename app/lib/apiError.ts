export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
  ) {
    super(code ?? `HTTP ${String(status)}`);
    this.name = 'ApiError';
  }
}
