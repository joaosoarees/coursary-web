import { deleteAccount } from './support/accounts';
import { hasState, readState } from './support/run';

export default function globalTeardown() {
  // A setup that failed has already removed what it created.
  if (!hasState()) {
    return;
  }

  // One account that fails to go must not keep the others in dev.
  const left = Object.values(readState().accounts).flatMap((account) => {
    try {
      deleteAccount(account);

      return [];
    } catch {
      return [account.email];
    }
  });

  if (left.length > 0) {
    throw new Error(`Not deleted, remove by hand: ${left.join(', ')}`);
  }
}
