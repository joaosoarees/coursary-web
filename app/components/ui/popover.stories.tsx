import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  args: { onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: false },
    open: { control: false },
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Sobre o certificado</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <p className="font-bold">Certificado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sai quando todas as aulas do curso estiverem concluídas.
        </p>
      </PopoverContent>
    </Popover>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '260px' },
      description: {
        component:
          'Um balão com conteúdo que abre sobre a tela a partir de um botão, sem bloquear o resto: uma explicação, um filtro curto, a caixa do sino. Fecha com `Esc` ou clicando fora. `PopoverContent` não tem espaçamento: quem usa decide o `p-*` e a largura. Para uma dica só de texto no hover, use Tooltip.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };
