import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Sign-in and refresh accept only the site's origin (Q482, Q490); the local proxy sends it in
// place of http://localhost, and moves the session cookie's /auth path under /api (Q494).
const SITE_ORIGIN = 'https://coursary-dev.joaodevdude.com';
const API_URL =
  process.env.VITE_API_URL ?? 'https://api-dev.coursary.joaodevdude.com';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: { origin: SITE_ORIGIN },
        cookiePathRewrite: { '/auth': '/api/auth' },
      },
    },
  },
});
