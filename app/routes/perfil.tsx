import { AvatarCard } from '~/account/AvatarCard';
import { ProfileForm } from '~/account/ProfileForm';
import { ErrorState } from '~/components/ErrorState';
import { PageHeader } from '~/components/PageHeader';
import { Skeleton } from '~/components/ui/skeleton';
import { useMe } from '~/queries/me';

import type { Route } from './+types/perfil';

export const meta: Route.MetaFunction = () => [{ title: 'Perfil · Coursary' }];

export default function ProfilePage() {
  const me = useMe();

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Perfil"
        description="Sua foto e seus dados na Coursary."
      />
      {me.isPending ? (
        <div
          className="grid gap-6 lg:grid-cols-[20rem_minmax(0,32rem)]"
          aria-hidden="true"
        >
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
      ) : me.isError ? (
        <ErrorState
          variant="block"
          title="Não deu para carregar o perfil"
          onRetry={() => void me.refetch()}
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,32rem)]">
          <AvatarCard profile={me.data} />
          <ProfileForm key={me.data.id} profile={me.data} />
        </div>
      )}
    </section>
  );
}
