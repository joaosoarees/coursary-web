---
name: Coursary
description: Plataforma de cursos em vídeo com a lousa verde da sala de aula como moldura e assinatura.
colors:
  primary: "#1f3a2e"
  primary-hover: "#2f5746"
  primary-foreground: "#f3f5f1"
  background: "#f3f5f1"
  foreground: "#13241b"
  card: "#ffffff"
  popover: "#ffffff"
  secondary: "#e6ece7"
  muted: "#e6ece7"
  muted-foreground: "#47594f"
  accent: "#d9e3db"
  destructive: "#b3372a"
  destructive-hover: "#8f2a20"
  destructive-foreground: "#ffffff"
  success: "#1d5c3a"
  success-soft: "#e3f1e8"
  highlight: "#fcf3d4"
  highlight-border: "#b8952a"
  progress: "#a08a2e"
  star: "#8a6d12"
  link: "#2b6b52"
  border: "#cfd9d1"
  input: "#7d9186"
  ring: "#2b6b52"
  shell: "#1f3a2e"
  shell-hover: "#2f5746"
  shell-foreground: "#eef3ee"
  shell-muted: "#a8c2b3"
  board: "#1f3a2e"
  chalk: "#eef3ee"
  chalk-yellow: "#f2c94c"
  chalk-yellow-foreground: "#112019"
  chalk-blue: "#9fd0ee"
  chalk-pink: "#f4a9b8"
  screen: "#0d1a14"
  screen-muted: "#c9d8ce"
  background-dark: "#112019"
  foreground-dark: "#eaf0ea"
  card-dark: "#162b22"
  popover-dark: "#183026"
  primary-dark: "#f2c94c"
  primary-hover-dark: "#f7dc85"
  primary-foreground-dark: "#112019"
  secondary-dark: "#1f3a2e"
  muted-dark: "#1f3a2e"
  muted-foreground-dark: "#a9bfb1"
  accent-dark: "#2a4a3b"
  destructive-dark: "#f08a7a"
  destructive-hover-dark: "#f5ada1"
  destructive-foreground-dark: "#112019"
  success-dark: "#b8ecc9"
  success-soft-dark: "#1f4a35"
  highlight-dark: "#2c3418"
  highlight-border-dark: "#a08a2e"
  progress-dark: "#f2c94c"
  star-dark: "#c9a443"
  link-dark: "#f2c94c"
  border-dark: "#2f4c3e"
  input-dark: "#5f7d6d"
  ring-dark: "#f2c94c"
  shell-hover-dark: "#2a4a3b"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.375
  wordmark:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-sm:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  label-sm:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
  table-head:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
rounded:
  sm: "4px"
  md: "6px"
  lg: "6px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "40px"
  gutter: "20px"
  gutter-desktop: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.accent}"
  button-ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-destructive-hover:
    backgroundColor: "{colors.destructive-hover}"
  button-link:
    textColor: "{colors.link}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-sm:
    padding: "0 16px"
    height: "40px"
  button-icon:
    size: "40px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  sidebar:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.shell-foreground}"
    width: "256px"
  sidebar-collapsed:
    width: "64px"
  sidebar-drawer:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.shell-foreground}"
    width: "300px"
  nav-item:
    textColor: "{colors.shell-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 11px"
    height: "44px"
  nav-item-hover:
    backgroundColor: "{colors.shell-hover}"
  nav-item-collapsed-active:
    backgroundColor: "{colors.shell-hover}"
  topbar-mobile:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.shell-foreground}"
    padding: "10px 12px"
  avatar:
    backgroundColor: "{colors.chalk-yellow}"
    rounded: "{rounded.full}"
    size: "36px"
  table-head:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.table-head}"
    padding: "0 8px"
    height: "40px"
  menu:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px"
  menu-item:
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "8px"
    height: "40px"
  dialog:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "24px"
    width: "512px"
---

# Design System: Coursary

## Overview

**Creative North Star: "A Lousa da Sala"**

A Coursary toma emprestada a lousa verde da sala de aula brasileira e a usa como moldura e assinatura do produto. A lousa é o trilho de navegação, em Verde Lousa, e nela só se escreve com giz: Giz Branco para o texto, Giz Amarelo para o que está ativo. O resto da interface é uma superfície de trabalho limpa e serena: no tema claro, um chão frio de Pó de Giz com folhas brancas; no tema escuro, o próprio chão vira lousa, em Lousa Noturna, e o trilho continua em Verde Lousa, um tom acima, para não se perder.

O tom é sereno, legível e deliberado. A densidade é de ferramenta: títulos firmes em Bricolage Grotesque, todo o resto em Atkinson Hyperlegible Next, números com largura fixa para que colunas e contadores se alinhem. Cada controle se anuncia com clareza (fundo ou borda no hover, contorno de foco de 2 px, alvo de pelo menos 40 px) e nada se ergue da página sem motivo. O sistema recusa o padrão da categoria: página branca, botão de marca roxo e cards de curso todos iguais.

O que já está construído é o mundo e a sua gramática: tokens nos dois temas, o trilho com o traço de giz, os componentes e os estados. As telas próprias do mundo ainda não existem e ficam aqui só como direção, **ainda não construídas**: capas de curso como placas de giz (um bloco cor de lousa com o título escrito em display numa única cor de giz: branco, azul ou rosa; o amarelo fica fora, porque marca o que está ativo), e um aviso amarelo que fica marcado até ser visto. O progresso já existe: seis traços de giz que nunca contradizem a contagem ao lado, cheios no que foi feito e tracejados no que falta; um curso começado mostra ao menos um traço cheio, e um inacabado deixa ao menos um aberto.

**Key Characteristics:**
- A lousa verde como moldura (o trilho) e o giz como única marca sobre ela.
- Tema claro em Pó de Giz e branco; tema escuro em que o chão é a lousa.
- Superfícies planas com bordas finas; sombra suave só no que flutua.
- Cantos de 6 px em controles e contêineres; pílula só em selos e avatares.
- Hierarquia por peso e caixa, nunca por um degrau a mais de tamanho em tabelas.
- Números tabulares em toda a página; contraste AA medido nos dois temas.

## Colors

Uma paleta de lousa: verdes profundos e frios como estrutura, giz claro como marca, e um único amarelo quente que significa "isto está ativo".

### Primary
- **Verde Lousa** (#1f3a2e): a lousa. Fundo do trilho de navegação nos dois temas, superfície das placas de giz (token `board`) e cor primária no tema claro (botão principal, selo padrão). No tema escuro, o trilho fica neste tom, mais claro que o chão, para continuar a ser lido como a lousa.
- **Verde Lousa Claro** (#2f5746): o hover do primário e dos itens do trilho no tema claro.
- **Giz Amarelo** (#f2c94c): o giz que marca. Traço sob o item ativo do trilho, ícone do tema escolhido, fundo do link "Pular para o conteúdo" e da seleção de texto, com o texto em Lousa Noturna nos dois temas. No tema escuro assume primário, link e anel de foco; o hover dele é o **Giz Amarelo Claro** (#f7dc85).

### Secondary
- **Verde Folha** (#2b6b52): link e anel de foco no tema claro; também o cursor de texto (caret), que segue o anel nos dois temas.
- **Giz Azul** (#9fd0ee) e **Giz Rosa** (#f4a9b8): cores de giz reservadas para escrever sobre a lousa (os títulos das futuras placas de giz). Medidas contra a lousa, ainda sem uso fora do mostruário.

### Tertiary
- **Tijolo** (#b3372a): ação destrutiva e erro no tema claro, com hover em **Tijolo Queimado** (#8f2a20). No escuro vira **Tijolo Claro** (#f08a7a), com hover **Tijolo Rosado** (#f5ada1) e texto em Lousa Noturna.
- **Verde Aprovado** (#1d5c3a) sobre **Verde Aprovado Suave** (#e3f1e8): sucesso. No escuro, **Verde Broto** (#b8ecc9) sobre **Verde Mata** (#1f4a35).
- **Creme de Giz** (#fcf3d4) com borda **Ocre de Giz** (#b8952a): o realce mantido, reservado ao aviso amarelo que fica até ser visto. No escuro, **Oliva Noturna** (#2c3418) com borda **Ocre Velho** (#a08a2e).
- **Ocre Velho** (#a08a2e; no escuro, **Giz Amarelo** #f2c94c): a barra fina de navegação pendente no topo da janela. Ela passa sobre a página e sobre a lousa, então precisa de 3:1 contra as duas: 3,62:1 sobre a lousa e 3,10:1 sobre o fundo no claro. O verde primário sumiria na lousa.
- **Ocre de Estrela** (#8a6d12; no escuro, **Ocre Claro** #c9a443): as estrelas das notas e avaliações. É ocre e não Giz Amarelo, porque uma nota não está "ativa".

### Neutral
- **Pó de Giz** (#f3f5f1): o chão do tema claro e o texto sobre o primário.
- **Lousa Noturna** (#112019): o chão do tema escuro, que é a própria lousa, e o texto sobre o primário amarelo e sobre o destrutivo no escuro.
- **Tinta Floresta** (#13241b): o texto do tema claro; no escuro, **Giz Pálido** (#eaf0ea).
- **Folha Branca** (#ffffff): cards e menus no tema claro. No escuro, os cards ficam em **Lousa Funda** (#162b22) e os menus um passo acima, em **Lousa Erguida** (#183026).
- **Giz Branco** (#eef3ee): o giz de texto sobre a lousa (rótulos do trilho, traço tracejado).
- **Musgo Claro** (#a8c2b3): texto secundário e ícones inativos sobre a lousa.
- **Névoa de Giz** (#e6ece7): fundo secundário e apagado no claro; no escuro, ambos ficam em Verde Lousa.
- **Verde Grafite** (#47594f): texto de apoio, legendas e cabeçalhos de tabela no claro; no escuro, **Sálvia de Giz** (#a9bfb1).
- **Sálvia Pálida** (#d9e3db): o fundo de hover de botões fantasma, contornados e itens de menu no claro; no escuro, **Lousa Gasta** (#2a4a3b), que também é o hover do trilho.
- **Fio de Sálvia** (#cfd9d1): bordas finas de cards, tabelas e divisores; no escuro, **Fio de Lousa** (#2f4c3e).
- **Tela Apagada** (#0d1a14): o quadro 16:9 do vídeo antes de ele tocar, nos dois temas; o texto sobre ele é Giz Branco e, quando secundário, **Giz Gasto** (#c9d8ce).
- **Cinza-Musgo** (#7d9186): a borda dos campos e dos controles contornados, a borda do estado vazio e o polegar da barra de rolagem; no escuro, **Musgo Fundo** (#5f7d6d).

### Named Rules
**The Chalk-Only Rule.** Sobre a lousa (trilho e placas) só se escreve com giz: Giz Branco, Musgo Claro, Giz Amarelo, Giz Azul ou Giz Rosa. Nenhuma cor de superfície ou de marca entra na lousa.

**The One Yellow Rule.** O Giz Amarelo quer dizer "ativo" ou "seu agora": item atual, tema escolhido, foco e primário no escuro, seleção, o aviso que espera ser visto. Não é decoração.

**The Measured Pair Rule.** Todo par novo de cores entra no teste de contraste antes de ser usado: texto a 4,5:1 e bordas de controle e anel de foco a 3:1, nos dois temas.

## Typography

**Display Font:** Bricolage Grotesque Variable (com ui-sans-serif, system-ui, sans-serif)
**Body Font:** Atkinson Hyperlegible Next Variable (com ui-sans-serif, system-ui, sans-serif)

**Character:** Uma grotesca de traço vivo, levemente desenhada à mão, para títulos e a marca, sobre uma sans feita para distinguir letras parecidas (Il1, O0). Ambas auto-hospedadas pelo @fontsource, pré-carregadas no root, sem CDN.

### Hierarchy
- **Display** (700, 2.25rem, 1.25, tracking -0.025em): o título de página do cabeçalho de página. Um por tela.
- **Headline** (700, 1.875rem, 1.2, tracking -0.025em): títulos de seção e o título da página de erro.
- **Title** (700, 1.25rem, 1.375): título de card, de estado vazio, de bloco.
- **Wordmark** (800, 1.5rem, tracking -0.025em): só o "Coursary", no topo do trilho e na barra do celular.
- **Body** (400, 1rem, 1.5): texto corrido, rótulos do trilho; parágrafos limitados a 65ch (`max-w-prose`).
- **Body small** (400, 0.875rem): apoio em Verde Grafite, células de tabela, itens de menu, abas; campos descem de 1rem para 0.875rem a partir de 768 px.
- **Label** (700, 1rem): texto de botão. **Label small** (700, 0.75rem): selos.
- **Table head** (700, 0.875rem, caixa alta, Verde Grafite): cabeçalho de tabela.

### Named Rules
**The Tabular Figures Rule.** Todo número da página usa algarismos tabulares (`font-variant-numeric: tabular-nums` no body). Contadores, durações, datas e progresso se alinham em coluna.

**The Rank by Weight Rule.** Em tabelas, o cabeçalho se distingue pelo peso, pela caixa alta e pela cor apagada, no mesmo tamanho das células. Nunca por um tamanho maior.

**The Two Faces Rule.** Bricolage só em títulos e na marca; todo o resto é Atkinson. Não existe terceira família.

## Layout

Um trilho e uma área de trabalho. O trilho é uma barra lateral de lousa que se recolhe. A partir de 768 px, fica fixo à esquerda, na altura da tela, sem borda: aberto mede 256 px; recolhido, 64 px, só de ícones. A largura muda em 200 ms com saída suave (ease-out) e o conteúdo acompanha. Os ícones não saem do lugar entre as duas larguras: só os textos somem e aparecem por opacidade, no mesmo tempo, e nada muda de tamanho ou de respiro no meio da transição. De cima para baixo: marca (24 px de respiro no topo), navegação (12 px laterais, 16 px no vertical) e, no pé, separados por um fio de giz a 10%, a troca de tema e a conta. A escolha entre aberto e recolhido fica guardada no navegador (`coursary:sidebar`), e Ctrl/Cmd+B alterna. Na área de trabalho, uma barra fina no topo (12 px por 16 px, fio de Fio de Sálvia embaixo) leva só o botão que abre e recolhe o trilho.

Abaixo de 768 px, o trilho sai da página. No topo fica uma barra de lousa (10 px por 12 px) com o botão de menu, a marca e o avatar; o menu abre o trilho como uma gaveta de 300 px, vinda da esquerda sobre o véu tingido de lousa, e seguir um link a fecha.

O conteúdo ocupa toda a largura ao lado da sidebar (os parágrafos seguem limitados a 65ch), com respiro lateral de 20 px no celular e 56 px no desktop, 32 a 40 px no vertical. O ritmo segue a escala de 4 px: 4 px entre título e descrição, 12 px entre ações, 16 a 24 px entre blocos, 40 px entre seções. Tabelas rolam na horizontal dentro do próprio contêiner em vez de quebrar a página. O rodapé diz, em Verde Grafite, que cursos, nomes e números são exemplos.

## Elevation & Depth

O sistema é plano. A profundidade vem do tom (chão, folha, menu um passo acima no escuro) e de bordas finas, não de sombras. Sombra existe em dois níveis, ambos suaves, deslocados para baixo e tingidos de Lousa Noturna, nunca pretos e nunca duros.

### Shadow Vocabulary
- **Assentado** (`box-shadow: 0 1px 2px rgb(17 32 25 / 0.08)`, token `--shadow-sm`): o card, e nada mais. Mal se vê; só assenta a folha no chão.
- **Erguido** (`box-shadow: 0 1px 2px rgb(17 32 25 / 0.08), 0 8px 24px -8px rgb(17 32 25 / 0.18)`, token `--shadow-md`): menus suspensos, listas de seleção e diálogos, o que flutua sobre a página.

### Named Rules
**The Flat Ground Rule.** Superfícies ficam planas, com borda fina. Só o que flutua sobre a página (menu, popover, diálogo) leva a sombra Erguida; cards levam só a Assentada; o resto não leva nenhuma.

## Shapes

Cantos firmes e discretos. Controles e contêineres usam 6 px (botões, campos, cards, diálogos, menus, itens do trilho); itens dentro de um menu usam 4 px, para caberem no menu de 6 px com 4 px de folga. Pílula (9999 px) só para selos e avatares. Bordas são de 1 px: Fio de Sálvia em cards, tabelas e divisores, Cinza-Musgo em campos e controles contornados. O estado vazio usa uma borda tracejada em Cinza-Musgo.

A forma própria do mundo é o **traço de giz**: um traço SVG ondulado de 3 px, pontas arredondadas, com pequenas falhas na linha contínua (o giz que pula na lousa) e uma variante tracejada. A marca repete a ideia: um quadro em contorno, um risco amarelo nele e um apagador em Musgo Claro embaixo.

## Components

Firmes, legíveis e marcados a giz: cada controle tem tamanho de dedo, bordas que se veem e um estado que nunca depende só da cor do texto.

### Buttons
- **Shape:** cantos de 6 px; texto em Label (700, 1rem); ícone de 18 px com 8 px de vão.
- **Primary:** Verde Lousa com texto Pó de Giz no claro, Giz Amarelo com texto Lousa Noturna no escuro; 44 px de altura, 20 px laterais.
- **Hover / Focus:** todo hover muda o fundo ou a borda (primário para Verde Lousa Claro, destrutivo para Tijolo Queimado, contornado para borda no anel e fundo Sálvia Pálida, fantasma e link para Sálvia Pálida, este também sublinhando). Foco por teclado: contorno de 2 px na cor do anel, afastado 2 px. Desabilitado: 50% de opacidade e cursor de bloqueio, sem hover.
- **Secondary / Outline / Ghost / Destructive / Link:** secundário em Névoa de Giz; contornado em folha com borda Cinza-Musgo; fantasma sem fundo até o hover; destrutivo em Tijolo; destrutivo contornado (o gatilho de uma ação sem volta, que confirma num diálogo) em folha com borda e texto Tijolo; link em Verde Folha (Giz Amarelo no escuro) com a mesma altura dos outros do seu tamanho.
- **Sizes:** padrão 44 px; pequeno 40 px com 16 px laterais; ícone 40 × 40 px.

### Chips (Badges)
- **Style:** pílula, 0.75rem em 700, 2 px por 10 px. Padrão em primário, secundário em Névoa de Giz, destrutivo em Tijolo, contornado com borda Cinza-Musgo.
- **State:** quando o selo é um link, ganha hover de fundo e o mesmo contorno de foco dos botões.

### Cards / Containers
- **Corner Style:** 6 px.
- **Background:** Folha Branca no claro, Lousa Funda no escuro.
- **Shadow Strategy:** só a Assentada (ver Elevation & Depth).
- **Border:** 1 px em Fio de Sálvia.
- **Internal Padding:** 24 px, com 24 px entre cabeçalho, conteúdo e rodapé; título em Title.

### Inputs / Fields
- **Style:** 44 px de altura, cantos de 6 px, borda de 1 px em Cinza-Musgo, fundo transparente no claro e Musgo Fundo a 30% no escuro; placeholder em Verde Grafite. O select segue o mesmo traçado e ganha a borda do anel no hover.
- **Focus:** a borda passa à cor do anel e um anel de 3 px na mesma cor envolve o campo. O cursor de texto também é da cor do anel.
- **Error / Disabled:** inválido troca a borda por Tijolo, e com foco o anel fica em Tijolo a 20% (40% no escuro); desabilitado a 50% de opacidade.

### Navigation
- **Trilho:** barra lateral em Verde Lousa nos dois temas, texto Giz Branco. Itens de 44 px, 11 px laterais, cantos de 6 px, ícone de 18 px em Musgo Claro com 12 px de vão, rótulo em Body a 85% em repouso, fundo em Verde Lousa Claro (Lousa Gasta no escuro) no hover. Foco: contorno de 2 px em Giz Amarelo, afastado 2 px.
- **Seções:** os itens se agrupam pelo que a pessoa faz: Estudar (Catálogo, Minhas matrículas), Ensinar (Meus cursos, para instrutor e admin) e Administrar (Usuários, só para admin). Cada seção leva um rótulo em versalete de 13 px, negrito, espaçado a 0,06em, em Musgo Claro, e 20 px separam uma seção da outra. Recolhido, o rótulo some por opacidade e guarda o lugar, para os ícones não subirem.
- **Item atual:** aberto, fica em negrito, com o ícone em Giz Amarelo e o **traço de giz** em Giz Amarelo, 64 px, logo abaixo do rótulo. Recolhido, sem rótulo para sublinhar, ganha o fundo de hover e mantém o ícone amarelo.
- **Recolhido:** só os ícones, nas mesmas posições; cada item mostra o próprio nome numa dica (tooltip) à direita, que só existe nessa largura. A marca fica só no desenho do quadro.
- **Abrir e recolher:** botão fantasma de ícone, 40 px, com o ícone de painel lateral, na barra fina sobre o conteúdo; a dica diz a ação e o atalho (Ctrl+B).
- **Troca de tema:** aberto, três botões de ícone de 40 px (Claro, Escuro, Sistema) no pé do trilho; o escolhido ganha fundo de hover e ícone em Giz Amarelo. Recolhido, no mesmo lugar, aparece um botão só, de 40 px, que passa de claro para escuro, de escuro para sistema e de sistema para claro, mostrando em Giz Amarelo o ícone do tema escolhido. Os dois se trocam por opacidade.
- **Conta:** no pé do trilho, abaixo do tema. Aberto: avatar de 36 px, nome em negrito e um chevron em Musgo Claro, numa linha de cantos de 6 px com fundo de hover; o menu abre para cima. Recolhido: só o avatar, num círculo de 40 px que no hover ganha um contorno de 2 px em Giz Branco a 35%, em vez de fundo; o menu abre para a direita. Sem foto, o avatar mostra as iniciais em negrito, pretas, sobre Giz Amarelo.
- **Celular:** barra de lousa no topo com o botão de menu (40 px), a marca e o avatar, cujo menu abre para baixo. A gaveta de 300 px traz o trilho aberto inteiro, com um botão de fechar de 40 px no canto (hover em Verde Lousa Claro, Lousa Gasta no escuro; foco em Giz Amarelo); seguir um link fecha a gaveta.
- **Pular para o conteúdo:** primeiro foco da página; aparece em Giz Amarelo com texto preto, cantos de 6 px.
- **Abas:** sublinhadas, sem caixa; a ativa em negrito com uma barra de 3 px em primário embaixo; hover em Sálvia Pálida.
- **Modos num cartão:** trocar o modo de um mesmo conteúdo ("Escrever" e "Prévia") usa botões segmentados, não abas: um trilho em Névoa de Giz com cantos de 6 px e a opção ativa em folha, em negrito. As abas sublinhadas ficam para navegar entre seções.

### Overlays
- **Menu e select:** folha de popover com borda fina, cantos de 6 px, 4 px de folga e a sombra Erguida. Itens de 40 px, cantos de 4 px, 0.875rem; o destacado ganha fundo Sálvia Pálida e um contorno interno de 2 px na cor do anel. Item destrutivo em Tijolo.
- **Diálogo:** até 512 px de largura, chão da página como fundo, borda fina, 24 px de respiro, sombra Erguida; entra com fade e escala de 98% a 100% em 200 ms e sai em 140 ms. Botão de fechar de 40 px no canto. Véu tingido de lousa: Verde Lousa a 50% no claro, preto a 55% no escuro.
- **Avisos (toasts):** folha de popover com borda fina, ícones de 16 px por tipo, seguindo o tema.

### Tables
- Texto em Body small, linhas separadas por Fio de Sálvia, hover de linha em Névoa de Giz a 50%; cabeçalho de 40 px em Table head. Números alinhados à direita, tabulares.

### Estados
- **Vazio:** bloco centralizado com borda tracejada em Cinza-Musgo, cantos de 6 px, 48 px de respiro vertical; ícone de 32 px em Verde Grafite, título em Title, descrição apagada e uma ação.
- **Primeiro uso:** quando a pessoa ainda não criou nada ("Você ainda não criou nenhum curso"), o vazio vira uma lousa: bloco em Verde Lousa de até 720 px, alinhado à esquerda, com o traço de giz amarelo no topo, título em Headline em Giz Branco, descrição em Musgo Claro e uma única ação em Giz Amarelo. O tracejado fica para as listas que só estão vazias.
- **Erro:** ícone de alerta em Tijolo ao lado de título e mensagem; na página inteira, título em Headline com "Tentar de novo" e "Ir para o início"; num bloco, um card com borda Cinza-Musgo e botão pequeno. A causa nunca aparece para quem lê.
- **Carregando:** blocos em Sálvia Pálida com cantos de 6 px, no formato do conteúdo que virá, com uma faixa de pó de giz que os atravessa a cada 1,6 s; o conteúdo entra com um fade de 150 ms.

### Traço de Giz (assinatura)
O marcador do mundo: um traço ondulado de 3 px em `currentColor`, contínuo com falhas ou tracejado, sempre sobre a lousa e sempre em uma cor de giz. Marca o item ativo do trilho aberto e se desenha sob ele ao trocar de página; um segmento do progresso concluído com a página aberta também se desenha.

**Direção para histórias futuras (ainda não construída, registrada para quando couber):** o traço de giz como marcador da aba ativa no lugar da barra de 3 px; o traço tracejado como contorno do estado vazio no lugar da borda tracejada de CSS; e a presença da lousa no tema claro além do trilho (as placas de giz são o primeiro candidato).

## Motion

Movimento explica uma ação ou uma mudança de estado; não há coreografia de página. Uma curva só, `ease-chalk` (`cubic-bezier(0.16, 1, 0.3, 1)`), sem quique. Só `transform`, `opacity` e o traço do SVG: nada que anime layout.

- **Diálogo:** 200 ms de entrada, 140 ms de saída, escala de 98% a 100%.
- **Menu, select e tooltip:** 150 ms com 4 px de deslize vindo do lado do gatilho, saída em 100 ms, sem zoom.
- **Gaveta:** 300 ms de entrada, 200 ms de saída.
- **Toasts:** 200 ms na mesma curva, saída em 140 ms.
- **Botão:** afunda a 98% por 100 ms ao clicar.
- **Barra de envio:** cresce com `scaleX`, nunca com a largura.
- **Navegação pendente:** a barra fina de 3 px em Ocre Velho (Giz Amarelo no escuro) só depois de 150 ms.
- **O momento autoral:** o traço de giz que se desenha (450 ms), sob o item ativo do trilho e no segmento de progresso recém-concluído, e o check de "Concluída" que se desenha (300 ms) quando a aula é concluída ali.

## Do's and Don'ts

### Do:
- **Do** manter o trilho em Verde Lousa (#1f3a2e) nos dois temas, mais claro que o chão Lousa Noturna no escuro.
- **Do** escrever sobre a lousa só em giz: Giz Branco, Musgo Claro, Giz Amarelo, Giz Azul, Giz Rosa.
- **Do** dar a todo clicável um hover de fundo ou de borda, um contorno de foco de 2 px na cor do anel afastado 2 px (Giz Amarelo sobre a lousa) e um alvo de pelo menos 40 px.
- **Do** usar 6 px de canto em controles e contêineres, 4 px em itens dentro de menus, pílula só em selos e avatares.
- **Do** classificar cabeçalhos de tabela por peso, caixa alta e cor apagada, no tamanho das células.
- **Do** usar algarismos tabulares em todo número.
- **Do** colocar todo par novo de cores no teste de contraste: 4,5:1 para texto, 3:1 para bordas de controle e anel, nos dois temas.
- **Do** restaurar o estilo do contorno (`outline-solid`) quando um contorno de foco convive com `outline-none` ou `outline-hidden` na mesma classe: o Tailwind 4 zera o estilo e o foco some.
- **Do** respeitar `prefers-reduced-motion`: saem deslizes, escalas, o pó de giz e os traços que se desenham (o traço aparece pronto); ficam os fades curtos e as mudanças de cor. Toda animação espacial ou em laço declara `motion-reduce:` onde é usada.

### Don't:
- **Don't** voltar ao padrão da categoria: página branca, botão de marca roxo e cards de curso todos iguais.
- **Don't** usar sombra em superfícies que não flutuam; cards levam só a Assentada, e nenhuma sombra é dura ou preta.
- **Don't** marcar hover só com a cor do texto.
- **Don't** subir o tamanho de um cabeçalho de tabela para dar hierarquia.
- **Don't** introduzir uma terceira família tipográfica nem carregar fontes de CDN.
- **Don't** gastar o Giz Amarelo em decoração: ele quer dizer ativo, escolhido ou à espera de ser visto.
