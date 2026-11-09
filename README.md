# Coursary Web

Frontend web da Coursary: React Router 8 em modo SPA (`ssr: false`) sobre Vite, com React Query, Tailwind 4 e shadcn/ui. Servido por S3 e CloudFront em `https://coursary-dev.joaodevdude.com`.

O planejamento, as decisões numeradas e o quadro de tarefas ficam no repositório da API: [joaosoarees/coursary-api](https://github.com/joaosoarees/coursary-api) (`PLANNING.md`, fase 6).

## Rodar na máquina

```bash
pnpm install
cp .env.example .env
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
pnpm test:coverage
pnpm validate:env    # confere as variáveis que o build vai ler; o pnpm build roda antes de empacotar
pnpm build
```

## Jornada contra `dev`

```bash
pnpm e2e:dev
```

O Playwright percorre o site publicado em `https://coursary-dev.joaodevdude.com` como as pessoas o usam:
- **conta:** cadastro até a confirmação, entrar, nome e foto, sair;
- **instrutor:** curso com capa, módulo, aula com texto, material e vídeo, prévia e publicar;
- **aluno:** busca, matrícula, conclusão, avaliação e minhas matrículas;
- **instrutor e alunos:** a lista de alunos e o CSV;
- **admin:** papel, desativar e reativar.

Rode-a antes de cada release `develop` → `main`, junto com o `pnpm e2e:dev` da API, depois do deploy de `dev`.

- **Contas:** antes de rodar, a jornada cria contas descartáveis pela API e as ativa com o AWS CLI. No fim apaga as contas, os cursos e os arquivos delas, mesmo quando um teste falha.
- **Credencial:** precisa do perfil AWS do projeto em `AWS_PROFILE` no `.env`. Por isso não roda no CI.
- **Falha:** guarda o trace e a captura de tela em `test-results/` (`pnpm exec playwright show-trace <arquivo>`).
- **Contra o `pnpm dev`:** não roda. A API só aceita entrar a partir da origem do site, e no `pnpm dev` a sessão passa pelo proxy.

## Variáveis de ambiente

Copie o `.env.example` para `.env`. O site valida as variáveis ao carregar (`app/lib/env.ts`), e o `pnpm build` roda o `pnpm validate:env` antes de empacotar, porque o Vite empacotaria com uma variável faltando.

| Variável | Valor em dev | Para quê |
|---|---|---|
| `VITE_API_URL` | `https://api-dev.coursary.joaodevdude.com` | Endereço da API: o alvo do proxy no `pnpm dev` e a base das chamadas no build. Entra no bundle, então nunca um segredo |
| `AWS_PROFILE` | o perfil do projeto | Só o `pnpm e2e:dev`: cria e apaga as contas da jornada com o AWS CLI |

## Deploy

O `dev` é deployado pelo GitHub Actions quando disparado à mão na `develop` (Actions → Deploy dev → Run workflow com **`develop`** em "Use workflow from", ou `gh workflow run deploy-dev.yml --ref develop`; Q495, Q516; disparado de outra branch, falha logo no início): build, role `coursary-web-deployer` por OIDC, `assets/` com `immutable`, o resto com `no-cache`, `index.html` por último, e invalidação só do `/index.html`. O bucket e a distribuição vêm do SSM (`/coursary-api/dev/site/*`), criados pela stack da API.

| Secret do Environment `dev` | Valor |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `WebDeployerRoleArn` nas saídas da stack `coursary-api-bootstrap` |
