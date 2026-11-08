import { noop, useQueryClient } from '@tanstack/react-query';
import { Ban, RotateCcw } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ROLE_LABEL } from '~/admin/users/AccountLabels';
import { AccountStatusBadge } from '~/admin/users/AccountStatusBadge';
import { RoleHistory } from '~/admin/users/RoleHistory';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { CourseFormat } from '~/components/course/CourseFormat';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { useChangeRole, useChangeStatus } from '~/mutations/admin';
import { accountByEmailQuery } from '~/queries/admin';
import { useMe } from '~/queries/me';
import {
  ACCOUNT_ROLES,
  type AccountRole,
  type AccountSummary,
  isAccountRole,
} from '~/services/AdminService';
import { ApiFailure } from '~/services/ApiFailure';

const REFUSALS = {
  CANNOT_CHANGE_OWN_ROLE: 'Você não pode mudar o seu próprio papel.',
  CANNOT_CHANGE_OWN_STATUS: 'Você não pode desativar a sua própria conta.',
  ACCOUNT_NOT_FOUND: 'Esta conta não existe mais.',
  ACCOUNT_NOT_ACTIVE:
    'A conta mudou enquanto isso. Confira o painel e tente de novo.',
  CONFLICT: 'A conta mudou enquanto isso. Confira o painel e tente de novo.',
};

// These refusals mean the account changed elsewhere: the panel shows what it is now.
const STALE = new Set(['ACCOUNT_NOT_ACTIVE', 'CONFLICT']);

type Section = 'role' | 'access';

const SECTION_TITLE: Record<Section, string> = {
  role: 'painel-conta-papel',
  access: 'painel-conta-acesso',
};

// Disabled controls keep their full colour on the border colour, as drawn.
const LOCKED =
  'aria-disabled:border-border aria-disabled:bg-transparent aria-disabled:text-input aria-disabled:opacity-100';

const ROLE_HINT =
  'Instrutor cria e edita os próprios cursos; aluno só estuda; admin também cuida das contas.';

const roleWord = (role: AccountRole) => ROLE_LABEL[role].toLowerCase();

const ROLE_CHANGE: Record<AccountRole, Partial<Record<AccountRole, string>>> = {
  student: {
    instructor: 'Passa a criar e editar os próprios cursos.',
    admin:
      'Passa a cuidar das contas da plataforma, além de criar e editar cursos.',
  },
  instructor: {
    student:
      'Deixa de criar e editar cursos. Os cursos que já tem continuam como estão, com os alunos e o progresso de cada um.',
    admin:
      'Passa a cuidar das contas da plataforma e continua com os próprios cursos.',
  },
  admin: {
    student:
      'Deixa de cuidar das contas e de criar e editar cursos. Os cursos que já tem continuam como estão.',
    instructor: 'Deixa de cuidar das contas e continua com os próprios cursos.',
  },
};

export function AccountPanel({
  account,
  onClose,
  onChanged,
  fallbackFocus,
}: {
  account: AccountSummary | null;
  onClose: () => void;
  onChanged: (account: AccountSummary) => void;
  fallbackFocus: React.RefObject<HTMLElement | null>;
}) {
  const opener = useRef<HTMLElement | null>(null);
  // Where the focus goes after a change rebuilds the panel: the section that made it.
  const [landing, setLanding] = useState<Section | null>(null);

  return (
    <Sheet
      open={account !== null}
      onOpenChange={(open) => {
        if (!open) {
          setLanding(null);
          onClose();
        }
      }}
    >
      <SheetContent
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-115"
        // Radix gives the focus back only to a SheetTrigger; a name in the table opens this one.
        onOpenAutoFocus={(event) => {
          opener.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          // The first control can be a locked one; the name says where the focus landed.
          event.preventDefault();
          if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget
              .querySelector<HTMLElement>('[data-slot="sheet-title"]')
              ?.focus();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          // The row that opened it leaves the list when the change moves the account elsewhere.
          (opener.current?.isConnected
            ? opener.current
            : fallbackFocus.current
          )?.focus();
        }}
      >
        {account && (
          // Keyed: a saved change starts the controls again from what the account now is.
          <PanelBody
            key={`${account.id}:${account.role}:${account.status}`}
            account={account}
            landing={landing}
            onChanged={(next, section) => {
              setLanding(section);
              onChanged(next);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function PanelBody({
  account,
  landing,
  onChanged,
}: {
  account: AccountSummary;
  landing: Section | null;
  onChanged: (account: AccountSummary, section: Section) => void;
}) {
  const me = useMe();

  useEffect(() => {
    if (landing) {
      document.getElementById(SECTION_TITLE[landing])?.focus();
    }
  }, [landing]);
  const own = me.data?.id === account.id;
  const active = account.status === 'ACTIVE';

  return (
    <>
      <SheetHeader className="gap-0.5 border-b px-6 pt-6 pb-5">
        <SheetTitle
          tabIndex={-1}
          className="pr-10 font-display text-2xl leading-tight font-bold tracking-tight [overflow-wrap:anywhere] outline-none"
        >
          {account.name}
        </SheetTitle>
        <SheetDescription className="text-base [overflow-wrap:anywhere]">
          {account.email}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 border-b py-5">
          <dt className="text-muted-foreground">Papel</dt>
          <dd className="font-bold">{ROLE_LABEL[account.role]}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <AccountStatusBadge status={account.status} />
          </dd>
          <dt className="text-muted-foreground">Criada em</dt>
          <dd>{CourseFormat.date(account.createdAt)}</dd>
        </dl>
        <RoleSection
          account={account}
          note={
            own
              ? 'Esta é a sua conta. Outro admin precisa mudar o seu papel.'
              : account.status === 'PENDING'
                ? 'A conta ainda não confirmou o e-mail. O papel só muda depois da confirmação.'
                : account.status === 'DISABLED'
                  ? 'Reative a conta para mudar o papel.'
                  : ROLE_HINT
          }
          locked={own || !active}
          onChanged={(next) => {
            onChanged(next, 'role');
          }}
        />
        <AccessSection
          account={account}
          note={
            own
              ? 'Esta é a sua conta. Outro admin precisa desativá-la.'
              : account.status === 'PENDING'
                ? 'A conta ainda não confirmou o e-mail, então ainda não entra. Ela só pode ser desativada depois da confirmação.'
                : account.status === 'DISABLED'
                  ? 'A conta está desativada: a pessoa não consegue entrar. Os cursos e as matrículas dela continuam como estão.'
                  : 'A pessoa sai na hora de todas as sessões e só volta a entrar quando a conta for reativada.'
          }
          locked={own || account.status === 'PENDING'}
          onChanged={(next) => {
            onChanged(next, 'access');
          }}
        />
        <RoleHistory accountId={account.id} myId={me.data?.id} />
      </div>
    </>
  );
}

function useShowWhatChanged(
  account: AccountSummary,
  onChanged: (account: AccountSummary) => void,
) {
  const queryClient = useQueryClient();

  return (error: Error) => {
    if (!STALE.has(ApiFailure.codeOf(error) ?? '')) {
      return;
    }

    queryClient
      .query({ ...accountByEmailQuery(account.email), staleTime: 0 })
      .then((fresh) => {
        if (
          fresh &&
          (fresh.role !== account.role || fresh.status !== account.status)
        ) {
          onChanged(fresh);
          toast(
            'A conta mudou enquanto isso. O painel agora mostra como ela está.',
          );
        }
      })
      .catch(noop);
  };
}

function RoleSection({
  account,
  note,
  locked,
  onChanged,
}: {
  account: AccountSummary;
  note: string;
  locked: boolean;
  onChanged: (account: AccountSummary) => void;
}) {
  const id = useId();
  const [role, setRole] = useState(account.role);
  const [confirming, setConfirming] = useState(false);
  const changeRole = useChangeRole();
  const showWhatChanged = useShowWhatChanged(account, onChanged);
  const changed = role !== account.role;

  return (
    <section
      aria-labelledby={SECTION_TITLE.role}
      className="flex flex-col gap-2.5 border-b py-6"
    >
      <h3
        id={SECTION_TITLE.role}
        tabIndex={-1}
        className="font-display text-lg font-bold outline-none"
      >
        Mudar o papel
      </h3>
      <label htmlFor={`${id}-role`} className="font-bold">
        Novo papel
      </label>
      <div className="flex flex-wrap gap-2">
        <Select
          value={role}
          disabled={locked}
          onValueChange={(value) => {
            if (isAccountRole(value)) {
              setRole(value);
            }
          }}
        >
          <SelectTrigger
            id={`${id}-role`}
            aria-describedby={`${id}-note`}
            className="min-w-40 flex-1"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {ROLE_LABEL[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={changed ? 'default' : 'outline'}
          aria-disabled={!changed}
          aria-describedby={`${id}-note`}
          className={LOCKED}
          onClick={() => {
            if (changed) {
              setConfirming(true);
            }
          }}
        >
          Salvar papel
        </Button>
      </div>
      <p id={`${id}-note`} className="max-w-[46ch] text-muted-foreground">
        {note}
      </p>
      <ConfirmDialog
        open={confirming}
        onClose={() => {
          setConfirming(false);
        }}
        onReset={changeRole.reset}
        pending={changeRole.isPending}
        error={
          changeRole.error
            ? ApiFailure.message(changeRole.error, REFUSALS)
            : null
        }
        title={`Tornar ${account.name} ${roleWord(role)}?`}
        description={ROLE_CHANGE[account.role][role] ?? ''}
        consequence="A mudança vale em até 1 hora, quando a sessão da pessoa se renova."
        confirm={{
          label: `Tornar ${roleWord(role)}`,
          pending: 'Salvando o papel…',
        }}
        onConfirm={() => {
          changeRole.mutate(
            { accountId: account.id, role },
            {
              onSuccess: (saved) => {
                setConfirming(false);
                onChanged({ ...account, role: saved.role });
                toast(`${account.name} agora é ${roleWord(saved.role)}.`);
              },
              onError: showWhatChanged,
            },
          );
        }}
      />
    </section>
  );
}

function AccessSection({
  account,
  note,
  locked,
  onChanged,
}: {
  account: AccountSummary;
  note: string;
  locked: boolean;
  onChanged: (account: AccountSummary) => void;
}) {
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const changeStatus = useChangeStatus();
  const showWhatChanged = useShowWhatChanged(account, onChanged);
  const enable = account.status === 'DISABLED';

  return (
    <section
      aria-labelledby={SECTION_TITLE.access}
      className="flex flex-col items-start gap-2.5 border-b py-6"
    >
      <h3
        id={SECTION_TITLE.access}
        tabIndex={-1}
        className="font-display text-lg font-bold outline-none"
      >
        Acesso
      </h3>
      <p id={`${id}-note`} className="max-w-[46ch] text-muted-foreground">
        {note}
      </p>
      {enable ? (
        <Button
          onClick={() => {
            setConfirming(true);
          }}
        >
          <RotateCcw aria-hidden="true" />
          Reativar conta
        </Button>
      ) : (
        <Button
          variant="destructive-outline"
          aria-disabled={locked}
          aria-describedby={`${id}-note`}
          className={LOCKED}
          onClick={() => {
            if (!locked) {
              setConfirming(true);
            }
          }}
        >
          <Ban aria-hidden="true" />
          Desativar conta
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        onClose={() => {
          setConfirming(false);
        }}
        onReset={changeStatus.reset}
        pending={changeStatus.isPending}
        error={
          changeStatus.error
            ? ApiFailure.message(changeStatus.error, REFUSALS)
            : null
        }
        title={
          enable
            ? `Reativar a conta de ${account.name}?`
            : `Desativar a conta de ${account.name}?`
        }
        description={
          enable
            ? `A pessoa volta a entrar com a mesma senha, com o papel que tinha: ${roleWord(account.role)}.`
            : 'A pessoa sai na hora de todas as sessões e não consegue entrar até a conta ser reativada. Os cursos e as matrículas continuam como estão.'
        }
        confirm={
          enable
            ? { label: 'Reativar conta', pending: 'Reativando…' }
            : {
                label: 'Desativar conta',
                pending: 'Desativando…',
                destructive: true,
              }
        }
        onConfirm={() => {
          changeStatus.mutate(
            { accountId: account.id, enable },
            {
              onSuccess: (saved) => {
                setConfirming(false);
                onChanged({ ...account, status: saved.status });
                toast(
                  enable
                    ? `A conta de ${account.name} foi reativada.`
                    : `A conta de ${account.name} foi desativada.`,
                );
              },
              onError: showWhatChanged,
            },
          );
        }}
      />
    </section>
  );
}
