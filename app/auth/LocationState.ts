// History state can hold anything: accept only a path inside this app. One "/" first, then
// neither "/" nor "\" ("//host" and "/\host" are other origins), and no whitespace or control
// characters (browsers drop tabs and newlines, so "/\t/host" becomes "//host").
// eslint-disable-next-line no-control-regex -- control characters are what it refuses.
const APP_PATH = /^\/(?![/\\])[^\s\u0000-\u001f\u007f]*$/;

const read = (state: unknown, key: string): unknown =>
  typeof state === 'object' && state !== null && key in state
    ? (state as Record<string, unknown>)[key]
    : undefined;

export class LocationState {
  static from(state: unknown): string | undefined {
    const from = read(state, 'from');

    return typeof from === 'string' && APP_PATH.test(from) ? from : undefined;
  }

  static email(state: unknown): string | undefined {
    const email = read(state, 'email');

    return typeof email === 'string' && email !== '' ? email : undefined;
  }
}
