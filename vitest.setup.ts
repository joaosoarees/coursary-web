import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { WebSocket as WsWebSocket } from 'ws';

afterEach(() => {
  cleanup();
});

// jsdom's WebSocket never fires 'open' under Vitest (undici rejects jsdom's Event). The `ws`
// client has the same interface, so the specs use it as the browser's.
class BrowserLikeWebSocket extends WsWebSocket {
  constructor(...args: ConstructorParameters<typeof WsWebSocket>) {
    super(...args);
    // A browser ignores an 'error' nobody listens to; an EventEmitter throws.
    this.on('error', () => undefined);
  }
}

globalThis.WebSocket = BrowserLikeWebSocket as unknown as typeof WebSocket;
