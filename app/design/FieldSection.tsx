import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { ShowcaseSection } from '~/design/ShowcaseSection';

export function FieldSection() {
  return (
    <ShowcaseSection
      id="campos"
      title="Campos"
      description="Rótulo, descrição, erro e desabilitado. O erro fica ligado ao campo por aria-describedby."
    >
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="design-titulo">Título do curso</FieldLabel>
          <Input id="design-titulo" placeholder="Ex.: Introdução a SQL" />
          <FieldDescription>
            Aparece no catálogo e na página do curso.
          </FieldDescription>
        </Field>
        <Field data-invalid="true">
          <FieldLabel htmlFor="design-email">E-mail</FieldLabel>
          <Input
            id="design-email"
            type="email"
            defaultValue="aluno@exemplo"
            aria-invalid="true"
            aria-describedby="design-email-erro"
          />
          <FieldError id="design-email-erro">
            Informe um e-mail completo, como nome@exemplo.com.
          </FieldError>
        </Field>
        <Field data-disabled="true">
          <FieldLabel htmlFor="design-slug">Endereço</FieldLabel>
          <Input id="design-slug" defaultValue="introducao-a-sql" disabled />
          <FieldDescription>
            Definido ao publicar; não muda depois.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="design-descricao">Descrição</FieldLabel>
          <Textarea
            id="design-descricao"
            placeholder="O que o aluno aprende neste curso?"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="design-nivel">Nível</FieldLabel>
          <Select defaultValue="iniciante">
            <SelectTrigger id="design-nivel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </ShowcaseSection>
  );
}
