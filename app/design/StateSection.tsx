import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

import { ChalkStroke } from '~/components/ChalkStroke';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { Button } from '~/components/ui/button';
import { ShowcaseSection, Specimen } from '~/design/ShowcaseSection';

export function StateSection() {
  return (
    <ShowcaseSection
      id="estados"
      title="Estados e avisos"
      description="Vazio, erro em um bloco, avisos passageiros e o traço de giz que marca o item atual."
    >
      <EmptyState
        icon={BookOpen}
        title="Nenhum curso por aqui ainda"
        description="Os cursos em que você se matricular aparecem nesta lista."
        action={<Button variant="outline">Ver o catálogo</Button>}
      />
      <ErrorState variant="block" onRetry={() => undefined} />
      <Specimen label="Avisos (aparecem no canto superior direito)">
        <Button variant="outline" onClick={() => toast.success('Curso salvo.')}>
          Sucesso
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error('Não foi possível salvar o curso.')}
        >
          Erro
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Rascunho salvo há 1 minuto.')}
        >
          Neutro
        </Button>
      </Specimen>
      <Specimen label="Traço de giz · contínuo e tracejado">
        <div className="flex flex-col gap-4 rounded-lg bg-board px-5 py-4">
          <ChalkStroke className="w-40 text-chalk-yellow" />
          <ChalkStroke dashed className="w-40 text-chalk" />
        </div>
      </Specimen>
    </ShowcaseSection>
  );
}
