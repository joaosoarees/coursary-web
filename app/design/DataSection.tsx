import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { ShowcaseSection, Specimen } from '~/design/ShowcaseSection';

const STUDENTS = [
  {
    name: 'Aluna de exemplo',
    initials: 'AE',
    progress: '75%',
    status: 'Em andamento',
  },
  {
    name: 'Aluno de teste',
    initials: 'AT',
    progress: '100%',
    status: 'Concluído',
  },
  {
    name: 'Pessoa fictícia',
    initials: 'PF',
    progress: '8%',
    status: 'Em andamento',
  },
];

export function DataSection() {
  return (
    <ShowcaseSection
      id="dados"
      title="Selos, cartões e tabelas"
      description="Como o catálogo e os painéis mostram cursos e alunos."
    >
      <Specimen label="Selos">
        <Badge>Publicado</Badge>
        <Badge variant="secondary">Rascunho</Badge>
        <Badge variant="outline">Iniciante</Badge>
        <Badge variant="destructive">Arquivado</Badge>
      </Specimen>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Curso de exemplo: estruturas de dados</CardTitle>
            <CardDescription>12 aulas · 3 h 40 min</CardDescription>
          </CardHeader>
          <CardContent>
            Listas, pilhas, filas e árvores, com exercícios em cada módulo.
          </CardContent>
          <CardFooter className="gap-3">
            <Button size="sm">Matricular</Button>
            <Badge variant="outline">Iniciante</Badge>
          </CardFooter>
        </Card>
        <Card aria-busy="true">
          <span className="sr-only">Carregando curso…</span>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
      <Table>
        <TableCaption>Alunos matriculados (dados de exemplo).</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead className="text-right">Progresso</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {STUDENTS.map(({ name, initials, progress, status }) => (
            <TableRow key={name}>
              <TableCell>
                <span className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {name}
                </span>
              </TableCell>
              <TableCell className="text-right">{progress}</TableCell>
              <TableCell>{status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ShowcaseSection>
  );
}
