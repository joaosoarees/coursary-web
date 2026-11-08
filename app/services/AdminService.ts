import { z } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';
import { httpClient } from '~/services/httpClient';

export const ACCOUNT_ROLES = ['student', 'instructor', 'admin'] as const;
export const ACCOUNT_STATUSES = ['PENDING', 'ACTIVE', 'DISABLED'] as const;

const accountSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(ACCOUNT_ROLES),
  status: z.enum(ACCOUNT_STATUSES),
  createdAt: z.string(),
});

const accountsPageSchema = z.object({
  items: z.array(accountSummarySchema),
  nextCursor: z.string().nullable(),
});

export type AccountSummary = z.infer<typeof accountSummarySchema>;
export type AccountsPage = z.infer<typeof accountsPageSchema>;
export type AccountRole = AccountSummary['role'];
export type AccountStatus = AccountSummary['status'];

export const isAccountRole = (value: string): value is AccountRole =>
  ACCOUNT_ROLES.some((role) => role === value);

export const isAccountStatus = (value: string): value is AccountStatus =>
  ACCOUNT_STATUSES.some((status) => status === value);

export interface AccountsFilter {
  role: AccountRole;
  status: AccountStatus | undefined;
}

export class AdminService {
  static async list(
    {
      role,
      status,
      cursor,
      limit,
    }: AccountsFilter & { cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<AccountsPage> {
    const { data } = await httpClient.get<unknown>('/admin/users', {
      params: { role, status, cursor, limit },
      signal,
    });

    return accountsPageSchema.parse(data);
  }

  // No account with the e-mail is an answer, not a failure.
  static async findByEmail(
    email: string,
    signal?: AbortSignal,
  ): Promise<AccountSummary | null> {
    try {
      const { data } = await httpClient.get<unknown>('/admin/users/by-email', {
        params: { email },
        signal,
      });

      return accountSummarySchema.parse(data);
    } catch (error) {
      if (ApiFailure.codeOf(error) === 'ACCOUNT_NOT_FOUND') {
        return null;
      }

      throw error;
    }
  }
}
