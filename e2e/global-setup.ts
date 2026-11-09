import {
  createAccount,
  deleteAccount,
  makeInstructor,
  promoteToAdmin,
} from './support/accounts';
import { type Account, type Role, ROLES, writeState } from './support/run';

const NAMES: Record<Role, string> = {
  instrutor: 'Instrutora E2E',
  aluno: 'Aluno E2E',
  admin: 'Admin E2E',
  alvo: 'Conta E2E',
};

export default async function globalSetup() {
  const stamp = Date.now().toString(36);
  const created: Partial<Record<Role, Account>> = {};

  try {
    for (const role of ROLES) {
      created[role] = await createAccount(`${NAMES[role]} ${stamp}`);
    }

    const { instrutor, aluno, admin, alvo } = created as Record<Role, Account>;
    promoteToAdmin(admin);
    await makeInstructor(admin, instrutor);
    writeState({ stamp, accounts: { instrutor, aluno, admin, alvo } });
  } catch (error) {
    // The teardown only knows a written state: what got this far is removed here.
    Object.values(created).forEach(deleteAccount);
    throw error;
  }
}
