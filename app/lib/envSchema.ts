import { z } from 'zod';

export const envSchema = z.object({
  VITE_API_URL: z.url({ protocol: /^https?$/ }),
  // ws:// only for a local server: the site's CSP lets the browser open wss:// alone.
  VITE_WS_URL: z.url({ protocol: /^wss?$/ }),
});
