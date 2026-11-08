import { RoleGuard } from '~/auth/RoleGuard';
import type { Profile } from '~/services/AccountService';

export const canTeach = (role: Profile['role']) => role !== 'student';

export function TeachingGuard() {
  return <RoleGuard allows={canTeach} />;
}
