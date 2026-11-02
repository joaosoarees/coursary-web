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
  ]),
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    ...(import.meta.env.DEV ? [route('design', 'routes/design.tsx')] : []),
    route('*', 'routes/not-found.tsx'),
  ]),
] satisfies RouteConfig;
