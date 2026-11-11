import { type BrowserContext, test as base } from '@playwright/test';

import { apiUrl } from './accounts';
import { type Account, readState, type Role, SITE_URL } from './run';

// Through the context's own request, whose cookies its pages share.
export async function signInAs(
  context: BrowserContext,
  role: Role,
): Promise<Account> {
  const account = readState().accounts[role];
  const response = await context.request.post(`${apiUrl()}/auth/sign-in`, {
    data: { email: account.email, password: account.password },
    headers: { origin: SITE_URL },
  });

  if (!response.ok()) {
    throw new Error(
      `Sign-in of ${role} answered ${String(response.status())}.`,
    );
  }

  return account;
}

// The API keeps one session per account and rotates the refresh cookie on every page load,
// so a saved storageState works once: each test signs in afresh.
export const test = base.extend<{
  role: Role | undefined;
  account: Account | undefined;
}>({
  role: [undefined, { option: true }],
  account: [
    async ({ role, context }, use) => {
      await use(role ? await signInAs(context, role) : undefined);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
