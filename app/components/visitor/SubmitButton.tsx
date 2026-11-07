import { LoaderCircle } from 'lucide-react';

import { Button } from '~/components/ui/button';

export function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <Button type="submit" disabled={pending}>
      {pending && (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      {pending ? pendingLabel : label}
    </Button>
  );
}
