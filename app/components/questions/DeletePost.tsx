import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '~/components/ConfirmDialog';
import { QuestionFailure } from '~/components/questions/QuestionFailure';
import { Button } from '~/components/ui/button';

// The Apagar button of a question or an answer, with its confirmation. The post leaves the page
// when it is deleted, so the focus goes where onDeleted puts it instead of the gone button.
export function DeletePost({
  label,
  title,
  description,
  confirmLabel,
  onDelete,
  onDeleted,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onDelete: () => Promise<unknown>;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  const confirm = async () => {
    setPending(true);
    setError(null);

    try {
      await onDelete();
      setDeleted(true);
      setOpen(false);
    } catch (failure) {
      if (QuestionFailure.isStale(failure)) {
        toast.error(QuestionFailure.message(failure));
        setDeleted(true);
        setOpen(false);
        return;
      }

      setError(QuestionFailure.message(failure));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={label}
        className="px-3 text-muted-foreground hover:text-destructive"
        onClick={() => {
          setOpen(true);
        }}
      >
        <Trash2 aria-hidden="true" />
        Apagar
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onCloseAutoFocus={(event) => {
          if (deleted) {
            event.preventDefault();
            onDeleted();
          }
        }}
        pending={pending}
        error={error}
        onReset={() => {
          setError(null);
        }}
        title={title}
        description={description}
        confirm={{
          label: confirmLabel,
          pending: 'Apagando…',
          destructive: true,
        }}
        onConfirm={() => {
          void confirm();
        }}
      />
    </>
  );
}
