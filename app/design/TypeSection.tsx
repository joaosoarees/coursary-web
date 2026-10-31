import { ShowcaseSection, Specimen } from '~/design/ShowcaseSection';

export function TypeSection() {
  return (
    <ShowcaseSection
      id="tipografia"
      title="Tipografia"
      description="Bricolage Grotesque nos títulos, Atkinson Hyperlegible Next no texto. Números com largura fixa em toda a página."
    >
      <div className="flex flex-col gap-6">
        <Specimen label="font-display · text-4xl · título da página">
          <p className="font-display text-4xl leading-tight font-bold tracking-tight">
            Curso de exemplo: estruturas de dados
          </p>
        </Specimen>
        <Specimen label="font-display · text-3xl · título de seção">
          <p className="font-display text-3xl font-bold tracking-tight">
            Módulo 1 · Listas e pilhas
          </p>
        </Specimen>
        <Specimen label="font-display · text-xl · título de bloco">
          <p className="font-display text-xl font-bold">
            Nenhum curso por aqui ainda
          </p>
        </Specimen>
        <Specimen label="font-sans · text-base · texto">
          <p className="max-w-prose">
            Texto de exemplo para medir a leitura: uma linha confortável fica
            entre 65 e 75 caracteres, e a Atkinson foi desenhada para distinguir
            letras parecidas como Il1 e O0.
          </p>
        </Specimen>
        <Specimen label="font-sans · text-sm · muted-foreground · apoio">
          <p className="text-sm text-muted-foreground">
            12 aulas · 3 h 40 min · atualizado em 30/10/2026
          </p>
        </Specimen>
        <Specimen label="tabular-nums · números alinhados">
          <p className="flex flex-col">
            <span>1.111 alunos</span>
            <span>9.808 alunos</span>
          </p>
        </Specimen>
      </div>
    </ShowcaseSection>
  );
}
