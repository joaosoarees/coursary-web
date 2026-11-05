import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { CourseStatus } from '~/services/InstructorService';

const LOOKS: Record<CourseStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Rascunho', className: '' },
  PUBLISHED: {
    label: 'Publicado',
    className: 'border-success/30 bg-success-soft text-success',
  },
  ARCHIVED: {
    label: 'Arquivado',
    className: 'border-border bg-muted text-muted-foreground',
  },
};

export function CourseStatusBadge({
  status,
  className,
}: {
  status: CourseStatus;
  className?: string;
}) {
  const look = LOOKS[status];

  return (
    <Badge variant="outline" className={cn(look.className, className)}>
      {look.label}
    </Badge>
  );
}
