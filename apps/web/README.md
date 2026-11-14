# Web app

The Stellar Ecosystem Stats front end: a Next.js (App Router) app in TypeScript,
styled with CSS Modules. It implements the "Terminal" design direction in dark
and light themes.

Run it from the repository root with `pnpm dev`; see the root README for the
other commands.

## Screens

| Route | Screen |
| --- | --- |
| `/` | Landing page |
| `/enroll` | Three-step enrollment |
| `/tenant/web` | Tenant web analytics |
| `/tenant/api` | Tenant API analytics |
| `/tenant/setup` | Instrumentation snippets and path normalization rules |
| `/tenant/privacy` | What is stored, compliance statement, erasure requests |
| `/operator` | Operator table across all projects |
| `/operator/compare` | Side-by-side comparison of up to three projects |
| `/operator/admin` | Enrollment model, project removal, metrics API keys |

`/tenant` redirects to `/tenant/web`. The header picks its tabs from the path:
see `src/lib/routes.ts`.

## How the code is organized

```
src/
  app/          Routes, root layout, design tokens (globals.css)
  features/     One folder per area: landing, enroll, tenant, operator
  components/
    shell/      Header, footer, theme toggle
    ui/         Shared pieces: cards, buttons, charts, fields, text styles
  data/         Demo dataset and the functions that shape it for each screen
  state/        State shared across screens
  lib/          Formatting, chart paths, theme, routes
  fonts/        Self-hosted font files and their licences
```

### Data

Everything a screen shows comes from `src/data`. Each module exports plain
functions (`getWebAnalytics(range)`, `selectProjects(projects, query)`, …) that
return display-ready values, so screens contain no calculations.

The numbers are generated from a fixed dataset (`projects.ts`) and seeded
series (`series.ts`), which keeps server and client renders identical. To
connect a real backend, replace the bodies of these functions, or the modules,
and keep the return types.

### State

`src/state` holds what more than one screen needs: the time range, the table's
sort and filters, the projects picked for comparison, and the enrollment draft.
It also holds the records a backend will own later (removed projects, API keys,
enrollment model, erasure requests). All of it lives in a reducer provided by
the root layout, so it survives navigation and resets on a full page load.

State that belongs to a single screen stays in that screen's component.

### Styling

Design tokens are CSS custom properties in `src/app/globals.css`; the light
theme overrides the colour tokens under `[data-theme="light"]`. Components use
CSS Modules. Shared classes in `components/ui` each own a distinct set of
properties (text, layout, tone), so combining them does not depend on
stylesheet order.

The theme is saved in `localStorage` and applied by an inline script in
`<head>` before first paint.

## Things to know about this Next.js version

`AGENTS.md` in this folder is maintained by `next dev` and points to the
documentation bundled with the installed version. Two behaviours matter here:

- **Visited pages stay mounted.** With `cacheComponents` on, Next.js hides the
  previous page instead of unmounting it, so component state survives going
  back and forth. A screen that must forget something when you leave it resets
  that state in a `useLayoutEffect` cleanup (see `AdminScreen.tsx`).
- **Hidden pages are still in the DOM.** Tests and scripts should select by
  role or filter by visibility.

## Tests

`pnpm test` runs Vitest with Testing Library. Test files sit next to the code
they cover: pure logic in `data`, `lib` and `state`, and the main user flows in
`features`.
