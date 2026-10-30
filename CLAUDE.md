# Coursary Web

Frontend da Coursary (React Router 8 SPA, React Query, Tailwind 4, shadcn/ui). Fase 6 do projeto.

- **Planejamento**: tudo fica no `PLANNING.md` de `../coursary` (joaosoarees/coursary-api): decisões numeradas (Q465 em diante para a fase 6), quadro de tarefas e convenções. Antes de propor algo, confira se já foi decidido lá.
- **Convenções** (Q478): as mesmas da API. Um arquivo por commit, cada commit compila e passa nos testes; Conventional Commits em inglês; sem `Co-Authored-By` nem linha de atribuição; nada de commit em `main` ou `develop`; `/code-review` antes de cada PR; merge só com autorização do autor (merge commit).
- **Dados do servidor** só no React Query; os `clientLoader` pedem ao `queryClient` (Q465). Estado de cliente global só quando uma história pedir (sem Zustand de antemão).
- **Testes** (Q471): Vitest com Testing Library; dados trocados por fakes na camada de chamadas, sem MSW.
- **Textos** em português, sem i18n (Q473).

## Comandos

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
