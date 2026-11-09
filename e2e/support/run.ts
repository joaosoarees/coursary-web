import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROLES = ['instrutor', 'aluno', 'admin', 'alvo'] as const;
export type Role = (typeof ROLES)[number];

export interface Account {
  name: string;
  email: string;
  password: string;
  accountId: string;
}

export interface RunState {
  stamp: string;
  accounts: Record<Role, Account>;
  course?: { id: string; title: string };
}

const RUN_DIR = join(import.meta.dirname, '..', '.run');
const STATE_FILE = join(RUN_DIR, 'state.json');

// The journey checks the deployed site: the API takes sign-ins from its origin only.
export const SITE_URL = 'https://coursary-dev.joaodevdude.com';

// A function: playwright.config.ts loads .env after its imports are evaluated.
export const siteUrl = () =>
  process.env.E2E_BASE_URL ?? 'https://coursary-dev.joaodevdude.com';

export const hasState = () => existsSync(STATE_FILE);

export function readState(): RunState {
  return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as RunState;
}

export function writeState(state: RunState) {
  mkdirSync(RUN_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function updateState(change: Partial<RunState>) {
  writeState({ ...readState(), ...change });
}

export function readCourse() {
  const { course } = readState();

  if (!course) {
    throw new Error('The instructor part of the journey created no course.');
  }

  return course;
}
