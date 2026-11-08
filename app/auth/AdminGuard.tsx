import { RoleGuard } from '~/auth/RoleGuard';
import type { Profile } from '~/services/AccountService';

export const canAdminister = (role: Profile['role']) => role === 'admin';

export function AdminGuard() {
  return <RoleGuard allows={canAdminister} />;
}
