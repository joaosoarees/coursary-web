# Coursary Web

Frontend da Coursary (React Router 8 SPA, React Query, Tailwind 4, shadcn/ui). Fase 6 do projeto. Estas regras valem para quem trabalhar aqui: a sessão principal e qualquer agente que ela lance. Um agente recebe este arquivo inteiro como parte da tarefa.

## Antes de escrever código

1. **Decisões**: tudo fica no `PLANNING.md` de `../coursary` (joaosoarees/coursary-api), numerado (Q465 em diante para a fase 6), com o quadro de tarefas. Confira se já foi decidido antes de propor.
2. **Skills primeiro.** Liste as skills instaladas que tocam a tarefa (as da história no quadro e qualquer outra cujo nome ou descrição caiba) e leia cada uma **inteira** antes de codar. Siga o que ela manda; quando o projeto decidir diferente, cite a Qxxx. Desvio sem decisão é bug.
3. **Biblioteca nova = a skill de setup dela inteira**, não só a instalação. Exemplo do que já escapou: o React Query entrou sem os devtools e com o client em `useState`, ambos pedidos pela `react-query-setup`.
4. **Design**: o `DESIGN.md` (quando existir) e o contrato em `.impeccable/surfaces/` mandam no visual; tokens só do `app/app.css`.

## Toda interface

- Todo elemento clicável tem `cursor: pointer` (botões já têm pela base do `app.css`), **hover visível** (mudança de fundo ou borda, não só de cor de texto), **foco visível** (`focus-visible:outline-2 outline-ring` ou equivalente com contraste de 3:1) e alvo de pelo menos **40 px**.
- Contraste AA nos **dois temas**; par novo de cores entra no `app/theme.test.ts`.
- `prefers-reduced-motion` respeitado; tudo usável por teclado.
- Textos em português, sem i18n (Q473); componente do shadcn chega em inglês, traduza.
- **Antes do PR, olhe no navegador**: `pnpm dev`, a tela nos temas claro e escuro, com hover e foco por teclado em cada controle novo. Teste verde não prova que o hover aparece.

## Código

- **Dados do servidor** só no React Query; os `clientLoader` pedem ao `queryClient` de `~/lib/queryClient` (Q465). Estado global de cliente só quando uma história pedir.
- **Error boundaries** (Q508): toda rota nova exporta `ErrorBoundary` ou herda o da área de propósito; todo bloco que quebra sozinho ganha o seu `react-error-boundary`; o fallback é o `ErrorState`.
- **Testes** (Q471): Vitest com Testing Library; dados trocados por fakes na camada de chamadas, sem MSW. Teste novo de comportamento crítico: quebre o código de propósito uma vez e veja o teste falhar.
- **Comentário só quando alguém erraria sem ele** (Q511, Q514): um limite externo, um porquê que o código não mostra, um motivo de segurança. Nunca o que a função ou a linha faz, narração de teste ou citação de decisão (Qxxx). Sai: `// Every call carries the session cookie (Q467).`
- **Dependência nova**: versão fixa (`-E`), publicada há pelo menos duas semanas; confira o que um CLI (shadcn e outros) adicionou ao `package.json` e remova o que duplica algo do projeto.

## Processo

- As convenções da API (Q478): um arquivo por commit, cada um compila e passa nos testes (dois arquivos juntos só quando inseparáveis, dizendo por quê); Conventional Commits em inglês; sem `Co-Authored-By` nem linha de atribuição; nada de commit em `main` ou `develop`.
- `/code-review` antes de cada PR, e no corpo do PR o que ele apontou e o que ficou de fora.
- Merge só com autorização do autor (merge commit).
- **Deploy de `dev` à mão** (Q516, Q517): Actions → Deploy dev → Run workflow com **`develop`** em "Use workflow from", ao fechar cada história.

## Comandos

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
