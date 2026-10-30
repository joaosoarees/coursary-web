import type { Config } from '@react-router/dev/config';

// A static SPA served by S3 and CloudFront: one index.html, no server (Q465, Q474).
export default {
  ssr: false,
} satisfies Config;
