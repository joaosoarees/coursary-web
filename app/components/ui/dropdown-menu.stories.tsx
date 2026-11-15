import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchiveIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  args: { onOpenChange: fn(), modal: true },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ações do curso</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Introdução ao TypeScript</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PencilIcon aria-hidden="true" />
            Editar
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArchiveIcon aria-hidden="true" />
            Arquivar
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Publicar</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2Icon aria-hidden="true" />
          Apagar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '360px' },
      description: {
        component:
          'Uma lista de ações que abre a partir de um botão. As setas andam entre os itens, letras pulam para o item que começa com elas e `Esc` fecha e devolve o foco. `variant="destructive"` marca o que apaga; um item desabilitado continua visível para dizer que a ação existe. Para escolher um valor de formulário, use Select.',
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const CheckboxAndRadio: Story = {
  render: function Render(args) {
    const [published, setPublished] = useState(true);
    const [level, setLevel] = useState('iniciante');

    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filtros</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuCheckboxItem
            checked={published}
            onCheckedChange={setPublished}
          >
            Só publicados
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Nível</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={level} onValueChange={setLevel}>
            <DropdownMenuRadioItem value="iniciante">
              Iniciante
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="intermediario">
              Intermediário
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="avancado">
              Avançado
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  args: { defaultOpen: true },
};

export const WithSubmenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Mais</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>Duplicar</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Exportar</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Alunos em CSV</DropdownMenuItem>
            <DropdownMenuItem>Perguntas em CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  args: { defaultOpen: true },
};
