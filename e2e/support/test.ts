import { test as base } from '@playwright/test';

import { apiUrl } from './accounts';
import { type Account, readState, type Role } from './run';

// The API keeps one session per account and rotates the refresh cookie on every page load,
// so a saved storageState works once: each test signs in afresh, through the context's own
// request, whose cookies the page shares.
export const test = base.extend<{
  role: Role | undefined;
  account: Account | undefined;
}>({
  role: [undefined, { option: true }],
  account: [
    async ({ role, context, baseURL }, use) => {
      const account = role && readState().accounts[role];

      if (account) {
        const response = await context.request.post(
          `${apiUrl()}/auth/sign-in`,
          {
            data: { email: account.email, password: account.password },
            headers: { origin: new URL(baseURL ?? '').origin },
          },
        );

        if (!response.ok()) {
          throw new Error(
            `Sign-in of ${role} answered ${String(response.status())}.`,
          );
        }
      }

      await use(account);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
