import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

export const sessionFile = (role: Role) => join(RUN_DIR, `${role}.json`);

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
