import type { AccountRole, AccountStatus } from '~/services/AdminService';

export const ROLE_LABEL: Record<AccountRole, string> = {
  student: 'Aluno',
  instructor: 'Instrutor',
  admin: 'Admin',
};

export const ROLE_TAB_LABEL: Record<AccountRole, string> = {
  student: 'Alunos',
  instructor: 'Instrutores',
  admin: 'Admins',
};

export const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Ativa',
  PENDING: 'Pendente',
  DISABLED: 'Desativada',
};

export const STATUS_FILTER_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Ativas',
  PENDING: 'Pendentes',
  DISABLED: 'Desativadas',
};
