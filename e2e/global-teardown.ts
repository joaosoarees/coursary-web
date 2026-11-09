import { deleteAccount } from './support/accounts';
import { hasState, readState } from './support/run';

export default function globalTeardown() {
  // A setup that failed has already removed what it created.
  if (!hasState()) {
    return;
  }

  Object.values(readState().accounts).forEach(deleteAccount);
}
