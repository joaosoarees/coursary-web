import { defineConfig, devices } from '@playwright/test';

import type { Role } from './e2e/support/run';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env: the variables come from the shell.
}

// Each project is one person's part of a single journey and needs the data the one
// before it left (the course published, the student enrolled), so they run in order.
const journey: { name: string; role?: Role }[] = [
  { name: 'conta' },
  { name: 'instrutor', role: 'instrutor' },
  { name: 'aluno', role: 'aluno' },
  { name: 'instrutor-alunos', role: 'instrutor' },
  { name: 'admin', role: 'admin' },
];

export default defineConfig<{ role: Role | undefined }>({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL ?? 'https://coursary-dev.joaodevdude.com',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: journey.map(({ name, role }, index) => ({
    name,
    testMatch: `${name}.spec.ts`,
    use: { role },
    dependencies: journey
      .slice(Math.max(index - 1, 0), index)
      .map((p) => p.name),
  })),
});
