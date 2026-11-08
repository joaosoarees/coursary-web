import { z } from 'zod';

import { ApiFailure } from '~/services/ApiFailure';
import { adminUserUrl } from '~/services/apiPaths';
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

const roleChangeSchema = z.object({
  id: z.string(),
  fromRole: z.enum(ACCOUNT_ROLES),
  toRole: z.enum(ACCOUNT_ROLES),
  changedBy: z.string(),
  changedAt: z.string(),
});

const roleChangesPageSchema = z.object({
  items: z.array(roleChangeSchema),
  nextCursor: z.string().nullable(),
});

const changedRoleSchema = z.object({
  id: z.string(),
  role: z.enum(ACCOUNT_ROLES),
});

const changedStatusSchema = z.object({
  id: z.string(),
  status: z.enum(ACCOUNT_STATUSES),
});

export type AccountSummary = z.infer<typeof accountSummarySchema>;
export type RoleChange = z.infer<typeof roleChangeSchema>;
export type RoleChangesPage = z.infer<typeof roleChangesPageSchema>;
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

  static async roleChanges(
    accountId: string,
    { cursor, limit }: { cursor: string | undefined; limit: number },
    signal?: AbortSignal,
  ): Promise<RoleChangesPage> {
    const { data } = await httpClient.get<unknown>(
      `${adminUserUrl(accountId)}/role-changes`,
      { params: { cursor, limit }, signal },
    );

    return roleChangesPageSchema.parse(data);
  }

  static async changeRole(accountId: string, role: AccountRole) {
    const { data } = await httpClient.put<unknown>(
      `${adminUserUrl(accountId)}/role`,
      { role },
    );

    return changedRoleSchema.parse(data);
  }

  static async disable(accountId: string) {
    const { data } = await httpClient.post<unknown>(
      `${adminUserUrl(accountId)}/disable`,
    );

    return changedStatusSchema.parse(data);
  }

  static async enable(accountId: string) {
    const { data } = await httpClient.post<unknown>(
      `${adminUserUrl(accountId)}/enable`,
    );

    return changedStatusSchema.parse(data);
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
