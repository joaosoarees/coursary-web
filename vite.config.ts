import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

// Sign-in and refresh accept only the site's origin; the local proxy sends it in
// place of http://localhost, and moves the session cookie's /auth path under /api.
const SITE_ORIGIN = 'https://coursary-dev.joaodevdude.com';

export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      proxy: {
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: { origin: SITE_ORIGIN },
          cookiePathRewrite: { '/auth': '/api/auth' },
        },
      },
    },
  };
});
