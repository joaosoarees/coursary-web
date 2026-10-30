import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { useHealth } from '~/queries/health';

import type { Route } from './+types/home';

export const meta: Route.MetaFunction = () => [{ title: 'Início · Coursary' }];

export default function Home() {
  const health = useHealth();

  const status = health.isLoading
    ? 'Verificando a API…'
    : health.isError
      ? 'A API não respondeu.'
      : health.data
        ? 'A API está no ar.'
        : 'Sem conexão: a verificação espera a rede voltar.';

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
