import { defineConfig, devices } from '@playwright/test';

import { type Role, SITE_URL } from './e2e/support/run';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env: the variables come from the shell.
}

// Each project is one person's part of the journey and needs what the one it follows
// left: the account's new name for the admin; the course, then the enrolment and the question,
// for the rest.
const journey: { name: string; role?: Role; after?: string }[] = [
  { name: 'conta' },
  { name: 'admin', role: 'admin', after: 'conta' },
  { name: 'instrutor', role: 'instrutor' },
  { name: 'aluno', role: 'aluno', after: 'instrutor' },
  { name: 'instrutor-alunos', role: 'instrutor', after: 'aluno' },
  { name: 'aluno-resposta', role: 'aluno', after: 'instrutor-alunos' },
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
    baseURL: SITE_URL,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: journey.map(({ name, role, after }) => ({
    name,
    testMatch: `${name}.spec.ts`,
    use: { role },
    dependencies: after ? [after] : [],
  })),
});
