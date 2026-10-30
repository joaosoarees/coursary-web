import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { apiGet } from '~/lib/api';

import type { Route } from './+types/home';

export const meta: Route.MetaFunction = () => [{ title: 'Coursary' }];

interface Health {
  status: 'ok';
}

export default function Home() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => apiGet<Health>('/health'),
  });

  const status = health.isPending
    ? 'Verificando a API…'
    : health.isError
      ? 'A API não respondeu.'
      : 'A API está no ar.';

  return (
    <section className="flex flex-col items-start gap-6">
      <PageHeader
        title="Início"
        description="O front da Coursary, ligado à API de dev."
      />
      <p role="status">{status}</p>
      <Button
        variant="outline"
        onClick={() => void health.refetch()}
        disabled={health.isFetching}
      >
        Verificar de novo
      </Button>
    </section>
  );
}
