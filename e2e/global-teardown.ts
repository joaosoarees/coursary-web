import { deleteAccount } from './support/accounts';
import { readState } from './support/run';

export default function globalTeardown() {
  Object.values(readState().accounts).forEach(deleteAccount);
}
