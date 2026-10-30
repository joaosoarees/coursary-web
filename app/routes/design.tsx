import { PageHeader } from '~/components/PageHeader';
import { ButtonSection } from '~/design/ButtonSection';
import { ColorSection } from '~/design/ColorSection';
import { DataSection } from '~/design/DataSection';
import { FieldSection } from '~/design/FieldSection';
import { OverlaySection } from '~/design/OverlaySection';
import { StateSection } from '~/design/StateSection';
import { TypeSection } from '~/design/TypeSection';

const SECTIONS = [
  { id: 'cores', label: 'Cores' },
  { id: 'tipografia', label: 'Tipografia' },
  { id: 'botoes', label: 'Botões' },
  { id: 'campos', label: 'Campos' },
  { id: 'navegacao', label: 'Abas, menu e diálogo' },
  { id: 'dados', label: 'Selos, cartões e tabelas' },
  { id: 'estados', label: 'Estados e avisos' },
];

export const meta = () => [{ title: 'Design · Coursary' }];

export default function Design() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Design"
        description="Os tokens e componentes do Quadro-verde em todos os estados. Só existe no servidor de desenvolvimento."
      />
      <nav aria-label="Seções">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex min-h-10 items-center rounded-sm text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ColorSection />
      <TypeSection />
      <ButtonSection />
      <FieldSection />
      <OverlaySection />
      <DataSection />
      <StateSection />
    </div>
  );
}
