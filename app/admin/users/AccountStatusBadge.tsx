import { STATUS_LABEL } from '~/admin/users/AccountLabels';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { AccountStatus } from '~/services/AdminService';

// The dot and the word carry the status; the colour only repeats it.
const LOOK: Record<AccountStatus, { badge: string; dot: string }> = {
  ACTIVE: {
    badge: 'border-transparent bg-success-soft text-success',
    dot: 'bg-success',
  },
  PENDING: { badge: 'border-input text-muted-foreground', dot: 'bg-input' },
  DISABLED: {
    badge: 'border-transparent bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const look = LOOK[status];

  return (
    <Badge variant="outline" className={cn('gap-1.5 text-sm', look.badge)}>
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', look.dot)}
      />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
