import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { fn } from 'storybook/test';

import { ThemeContext } from '~/theme/ThemeProvider';

import { Button } from './button';
import { Toaster } from './sonner';

const meta = {
  title: 'UI/Sonner',
  component: Toaster,
  // The real ThemeProvider writes the class on <html> and in storage, which is the toolbar's job here.
  decorators: [
    (Story, { globals }) => {
      const resolvedTheme = globals.theme === 'dark' ? 'dark' : 'light';

      return (
        <ThemeContext
          value={{ theme: resolvedTheme, resolvedTheme, setTheme: fn() }}
        >
          <Story />
        </ThemeContext>
      );
    },
  ],
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Toaster {...args} />
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
        onClick={() => toast.info('O CSV fica pronto em alguns minutos.')}
      >
        Informação
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.loading('Enviando o vídeo…', { duration: 3000 })}
      >
        Carregando
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        component:
          'O aviso curto que confirma uma ação ou conta uma falha, no canto da tela, sem tirar o foco de onde está. O app tem um `Toaster` só, no `root.tsx`; qualquer tela chama `toast.success`, `toast.error`, `toast.info` ou `toast.loading`. Ele segue o tema pelo `useTheme`. Para um erro que a pessoa precisa resolver num campo, use o erro do Field, não um aviso que some.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Notices: Story = {};
