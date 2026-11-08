import { AdminGuard } from '~/auth/AdminGuard';

export default function AdminLayout() {
  return <AdminGuard />;
}
