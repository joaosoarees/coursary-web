import { ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ShowcaseSection, Specimen } from '~/design/ShowcaseSection';

export function OverlaySection() {
  return (
    <ShowcaseSection
      id="navegacao"
      title="Abas, menu e diálogo"
      description="Abra cada um pelo teclado: Enter ou espaço abre, setas movem, Esc fecha e o foco volta ao gatilho."
    >
      <Tabs defaultValue="aulas" className="max-w-xl">
        <TabsList>
          <TabsTrigger value="aulas">Aulas</TabsTrigger>
          <TabsTrigger value="material">Material</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="aulas" className="pt-3">
          12 aulas em 3 módulos.
        </TabsContent>
        <TabsContent value="material" className="pt-3">
          2 arquivos para baixar.
        </TabsContent>
        <TabsContent value="avaliacoes" className="pt-3">
          Nenhuma avaliação ainda.
        </TabsContent>
      </Tabs>
      <Specimen label="Menu de ações · diálogo de confirmação">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Ações
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <Pencil aria-hidden="true" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy aria-hidden="true" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Arquivar curso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Arquivar este curso?</DialogTitle>
              <DialogDescription>
                Ele sai do catálogo. Quem já está matriculado continua com
                acesso às aulas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Arquivar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Specimen>
    </ShowcaseSection>
  );
}
