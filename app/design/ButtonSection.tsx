import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '~/components/ui/button';
import { ShowcaseSection, Specimen } from '~/design/ShowcaseSection';

const VARIANTS = [
  { variant: 'default', label: 'Publicar' },
  { variant: 'secondary', label: 'Salvar rascunho' },
  { variant: 'outline', label: 'Pré-visualizar' },
  { variant: 'ghost', label: 'Cancelar' },
  { variant: 'destructive', label: 'Excluir' },
  { variant: 'link', label: 'Ver todos' },
] as const;

export function ButtonSection() {
  return (
    <ShowcaseSection
      id="botoes"
      title="Botões"
      description="Passe o mouse e navegue com Tab: todo botão tem hover de fundo ou borda e contorno de foco."
    >
      <Specimen label="Variantes · tamanho padrão (44 px)">
        {VARIANTS.map(({ variant, label }) => (
          <Button key={variant} variant={variant}>
            {label}
          </Button>
        ))}
      </Specimen>
      <Specimen label="Variantes · sm (40 px)">
        {VARIANTS.map(({ variant, label }) => (
          <Button key={variant} variant={variant} size="sm">
            {label}
          </Button>
        ))}
      </Specimen>
      <Specimen label="Desabilitados">
        {VARIANTS.map(({ variant, label }) => (
          <Button key={variant} variant={variant} disabled>
            {label}
          </Button>
        ))}
      </Specimen>
      <Specimen label="Com ícone · só ícone · link com cara de botão">
        <Button>
          <Plus aria-hidden="true" />
          Novo curso
        </Button>
        <Button variant="outline" size="icon" aria-label="Excluir aula">
          <Trash2 aria-hidden="true" />
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Ir para o início</Link>
        </Button>
      </Specimen>
    </ShowcaseSection>
  );
}
