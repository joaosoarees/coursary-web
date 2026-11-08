import {
  type AccountRole,
  type AccountsFilter,
  type AccountStatus,
} from '~/services/AdminService';

// The address speaks Portuguese; the API speaks its own codes.
const ROLE_PARAM: Record<AccountRole, string> = {
  student: 'alunos',
  instructor: 'instrutores',
  admin: 'admins',
};

const STATUS_PARAM: Record<AccountStatus, string> = {
  ACTIVE: 'ativas',
  PENDING: 'pendentes',
  DISABLED: 'desativadas',
};

const keyOf = <Code extends string>(
  table: Record<Code, string>,
  value: string | null,
) => (Object.keys(table) as Code[]).find((code) => table[code] === value);

export class AccountsFilterParams {
  static read(params: URLSearchParams): AccountsFilter {
    return {
      role: keyOf(ROLE_PARAM, params.get('papel')) ?? 'student',
      status: keyOf(STATUS_PARAM, params.get('status')),
    };
  }

  static write({ role, status }: AccountsFilter): URLSearchParams {
    const params = new URLSearchParams();

    if (role !== 'student') {
      params.set('papel', ROLE_PARAM[role]);
    }

    if (status) {
      params.set('status', STATUS_PARAM[status]);
    }

    return params;
  }
}
