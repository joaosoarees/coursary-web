import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  layout('routes/visitor-layout.tsx', [
    route('entrar', 'routes/entrar.tsx'),
    route('cadastro', 'routes/cadastro.tsx'),
    route('confirmar', 'routes/confirmar.tsx'),
    route('recuperar-senha', 'routes/recuperar-senha.tsx'),
    route('redefinir-senha', 'routes/redefinir-senha.tsx'),
  ]),
  layout('routes/classroom-layout.tsx', [
    route('cursos/:id/aulas/:aulaId', 'routes/aula.tsx'),
  ]),
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    route('cursos', 'routes/cursos.tsx'),
    route('cursos/:id', 'routes/curso.tsx'),
    route('cursos/:id/continuar', 'routes/continuar.tsx'),
    route('minhas-matriculas', 'routes/minhas-matriculas.tsx'),
    route('perfil', 'routes/perfil.tsx'),
    layout('routes/teaching-layout.tsx', [
      route('instrutor/cursos', 'routes/meus-cursos.tsx'),
      route('instrutor/cursos/novo', 'routes/novo-curso.tsx'),
    ]),
    ...(import.meta.env.DEV ? [route('design', 'routes/design.tsx')] : []),
    route('*', 'routes/not-found.tsx'),
  ]),
] satisfies RouteConfig;
