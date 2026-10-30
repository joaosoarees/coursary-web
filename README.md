# Coursary Web

Frontend web da Coursary: React Router 8 em modo SPA (`ssr: false`) sobre Vite, com React Query, Tailwind 4 e shadcn/ui. Servido por S3 e CloudFront em `https://coursary-dev.joaodevdude.com`.

O planejamento, as decisões numeradas e o quadro de tarefas ficam no repositório da API: [joaosoarees/coursary-api](https://github.com/joaosoarees/coursary-api) (`PLANNING.md`, fase 6).

## Rodar na máquina

```bash
pnpm install
pnpm dev
```

O app abre em `http://localhost:5173` e fala com a API de `dev` pelo proxy do Vite em `/api` (Q494). O proxy troca o `Origin` pelo do site, que é o único que o sign-in e o refresh aceitam, e põe o cookie da sessão sob `/api/auth`.

Use o Chrome ou o Firefox: o Safari não guarda o cookie `Secure` da sessão vindo de `http://localhost` (Q490).

## Comandos

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm test
pnpm build    # VITE_API_URL diz onde fica a API no build
```

## Deploy

O `dev` é deployado pelo GitHub Actions quando disparado à mão na `develop` (Actions → CI → Run workflow, ou `gh workflow run ci.yml --ref develop`; Q495, Q516): build, role `coursary-web-deployer` por OIDC, `assets/` com `immutable`, o resto com `no-cache`, `index.html` por último, e invalidação só do `/index.html`. O bucket e a distribuição vêm do SSM (`/coursary-api/dev/site/*`), criados pela stack da API.

| Secret do Environment `dev` | Valor |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `WebDeployerRoleArn` nas saídas da stack `coursary-api-bootstrap` |
