import { noop, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
} from 'lucide-react';
import { useEffect } from 'react';
import { Form, Link, useSearchParams } from 'react-router';

import { CourseGrid, CourseGridSkeleton } from '~/components/course/CourseGrid';
import { EmptyState } from '~/components/EmptyState';
import { ErrorState } from '~/components/ErrorState';
import { LoadMore } from '~/components/LoadMore';
import { PageHeader } from '~/components/PageHeader';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { queryClient } from '~/lib/queryClient';
import { cn } from '~/lib/utils';
import {
  catalogQuery,
  searchQuery,
  useCatalog,
  useSearch,
} from '~/queries/catalog';
import type { CatalogItem } from '~/services/CatalogService';
import { isSignedIn } from '~/session/session';

import type { Route } from './+types/cursos';

export const meta: Route.MetaFunction = () => [
  { title: 'Catálogo · Coursary' },
];

const NO_COURSES: CatalogItem[] = [];

const readSearch = (params: URLSearchParams) => {
  const query = params.get('busca')?.trim() ?? '';
  const page = Number.parseInt(params.get('pagina') ?? '1', 10);

  return { query, page: Number.isInteger(page) && page > 0 ? page : 1 };
};

const searchHref = (query: string, page: number) =>
  `/cursos?${new URLSearchParams({ busca: query, pagina: String(page) }).toString()}`;

// Starts the read and lets the page open on its skeleton; waiting here held the old page.
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (!isSignedIn()) {
    return null;
  }

  const { query, page } = readSearch(new URL(request.url).searchParams);

  if (query) {
    void queryClient.query(searchQuery({ query, page: page - 1 })).catch(noop);
  } else {
    void queryClient.infiniteQuery(catalogQuery).catch(noop);
  }

  return null;
}

export default function CatalogPage() {
  const [params] = useSearchParams();
  const { query, page } = readSearch(params);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Catálogo"
        description="Cursos publicados por instrutores da plataforma."
        actions={<SearchForm key={query} query={query} />}
      />
      {query ? <SearchResults query={query} page={page} /> : <CatalogList />}
    </section>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <Form
      method="get"
      action="/cursos"
      role="search"
      className="flex w-full gap-2 md:w-[30rem]"
    >
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          name="busca"
          defaultValue={query}
          aria-label="Buscar cursos"
          placeholder="Título, instrutor ou assunto"
          maxLength={200}
          className="pl-10"
        />
      </div>
      <Button type="submit">Buscar</Button>
    </Form>
  );
}

function CatalogList() {
  const list = useCatalog();
  const { data, isLoading, isLoadingError, refetch } = list;
  const courses = data?.pages.flatMap((page) => page.items) ?? NO_COURSES;
  if (isLoading) {
    return <CourseGridSkeleton />;
  }

  if (isLoadingError) {
    return (
      <ErrorState
        variant="block"
        title="Não deu para carregar o catálogo"
        onRetry={() => void refetch()}
      />
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Nenhum curso publicado ainda"
        description="Os cursos aparecem aqui assim que um instrutor publicar o primeiro."
      />
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <CourseGrid courses={courses} />
      <LoadMore
        list={list}
        labels={{
          more: 'Carregar mais cursos',
          loading: 'Carregando mais cursos…',
          failed: 'Não deu para carregar mais cursos.',
        }}
        className="items-center"
      >
        <p role="status" className="text-sm text-muted-foreground">
          Mostrando {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
        </p>
      </LoadMore>
    </div>
  );
}

function SearchResults({ query, page }: { query: string; page: number }) {
  const client = useQueryClient();
  const { data, isLoading, isLoadingError, isPlaceholderData, refetch } =
    useSearch({ query, page: page - 1 });
  const totalPages = data?.totalPages;
  const nextPageExists =
    !isPlaceholderData && totalPages !== undefined && page < totalPages;

  useEffect(() => {
    if (nextPageExists) {
      client.query(searchQuery({ query, page })).catch(noop);
    }
  }, [client, nextPageExists, query, page]);

  const heading = (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="font-display text-xl font-bold tracking-tight">
        Resultados para “{query}”
      </h2>
      <Link
        to="/cursos"
        className="inline-flex min-h-10 items-center rounded-md font-bold text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Limpar busca
      </Link>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <CourseGridSkeleton />
      </div>
    );
  }

  if (isLoadingError) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <ErrorState
          variant="block"
          title="Não deu para buscar agora"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const courses = data?.items ?? NO_COURSES;

  if (
    courses.length === 0 &&
    totalPages !== undefined &&
    totalPages > 0 &&
    page > totalPages
  ) {
    return (
      <EmptyState
        icon={SearchX}
        title="Esta página da busca não existe"
        description={`A busca por “${query}” tem ${String(totalPages)} ${totalPages === 1 ? 'página' : 'páginas'}.`}
        action={
          <Button variant="outline" asChild>
            <Link to={searchHref(query, 1)}>Ir para a primeira página</Link>
          </Button>
        }
      />
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={`Nenhum curso para “${query}”`}
        description="Confira a grafia ou tente uma palavra mais geral, como o assunto ou o nome do instrutor."
        action={
          <Button variant="outline" asChild>
            <Link to="/cursos">Limpar busca</Link>
          </Button>
        }
      />
    );
  }

  const pages = totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6">
      {heading}
      <div
        aria-busy={isPlaceholderData}
        className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}
      >
        <CourseGrid courses={courses} />
      </div>
      {pages > 1 && (
        <nav
          aria-label="Páginas da busca"
          className="flex items-center justify-center gap-3"
        >
          <PageLink
            to={page > 1 ? searchHref(query, page - 1) : undefined}
            label="Anterior"
            icon="previous"
          />
          <span className="min-w-32 text-center text-muted-foreground">
            Página {page} de {pages}
          </span>
          <PageLink
            to={page < pages ? searchHref(query, page + 1) : undefined}
            label="Próxima"
            icon="next"
          />
        </nav>
      )}
    </div>
  );
}

function PageLink({
  to,
  label,
  icon,
}: {
  to: string | undefined;
  label: string;
  icon: 'previous' | 'next';
}) {
  const content = (
    <>
      {icon === 'previous' && <ChevronLeft aria-hidden="true" />}
      {label}
      {icon === 'next' && <ChevronRight aria-hidden="true" />}
    </>
  );

  if (to === undefined) {
    return (
      <Button variant="outline" disabled>
        {content}
      </Button>
    );
  }

  return (
    <Button variant="outline" asChild>
      <Link to={to}>{content}</Link>
    </Button>
  );
}
