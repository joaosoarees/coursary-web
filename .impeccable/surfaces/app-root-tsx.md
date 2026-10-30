---
version: 1
slug: "app-root-tsx"
primary_target: "app/root.tsx"
related_targets: []
---

## Scope

The whole coursary-web shell and its first three screens (sign-in, catalog, instructor dashboard). Mode: Operate. Audience: students, instructors and admins of a portfolio course platform; evaluators read it as a shipped product.

## Direction contract

THESIS: The Brazilian classroom's green chalkboard as the product's shell and signature, on a clean working surface. It refuses the category default of a white page with a purple brand button and look-alike course cards.

OWN-WORLD: Committed colour: deep lousa green (#1f3a2e) owns the navigation rail and the brand panel; chalk white and chalk yellow (#f2c94c) are the only marks on it. Light theme works on a cool chalk-dust ground (#f3f5f1) with white surfaces; dark theme turns the ground into the board itself (#112019). Course covers are authored chalk plates: a board-coloured tile with the title written in display type in one chalk colour (white, yellow, blue, pink). Faces: Bricolage Grotesque for headings and the wordmark, Atkinson Hyperlegible Next for everything else, tabular figures for every number. Radius 6 px; hairline borders, soft offset shadows only on raised menus and dialogs.

STORY: A student sees what to continue and what to discover; an instructor sees the state of every course and what changed since the last visit; nobody hunts for navigation.

FIRST VIEWPORT: Left rail in lousa green (wordmark, navigation by role, account at the foot); the active item underlined with a chalk stroke. Catalog: page title, search, a "continue" strip whose progress is the signature, then a grid of chalk-plate covers. Instructor: title with "Novo curso", a held yellow notice for changes not yet seen, then the courses table.

FORM: Quadro-verde, candidate 5 of 7 on the grounded list; seed 4ca2323e. Signature move: the chalk stroke, used for the active navigation item and for course progress drawn as equal module segments on one baseline, the current one marked in chalk yellow. Raises: stage strip on a shared baseline (botanical folio), a changed state held in chalk yellow until seen (gate board), tabular figures everywhere (datamatics), table rank by weight and case, not size (timetable).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

Exact token scale and the components come in 6.3 b to g; the exploration canvas is the reference until DESIGN.md exists.
