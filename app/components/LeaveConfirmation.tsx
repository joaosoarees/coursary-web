import { useEffect } from 'react';
import { useBlocker } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

// Holds back a navigation inside the app while there are unsaved changes.
export function LeaveConfirmation({ when }: { when: boolean }) {
  const blocker = useBlocker(when);
  const blocked = blocker.state === 'blocked';

  // Saved while a navigation was held back: nothing is left to lose, let it through.
  useEffect(() => {
    if (blocker.state === 'blocked' && !when) {
      blocker.proceed();
    }
  }, [blocker, when]);

  return (
    <Dialog
      open={blocked && when}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked') {
          blocker.reset();
        }
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-[30rem]">
        <DialogHeader className="gap-4">
          <DialogTitle>Sair sem salvar?</DialogTitle>
          <DialogDescription className="text-base">
            As alterações que você fez nesta página ainda não foram salvas e
            serão perdidas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              blocker.reset?.();
            }}
          >
            Continuar editando
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              blocker.proceed?.();
            }}
          >
            Sair sem salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
