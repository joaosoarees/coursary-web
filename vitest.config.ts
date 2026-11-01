import { defineConfig } from 'vitest/config';

// Without the React Router plugin, which builds the whole app: tests render components.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    env: { VITE_API_URL: 'https://api.test' },
    include: ['app/**/*.{spec,test}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['app/**/*.{ts,tsx}'],
      exclude: ['app/**/*.{spec,test}.{ts,tsx}', 'app/**/+types/**'],
    },
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
