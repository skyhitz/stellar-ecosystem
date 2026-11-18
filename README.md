# Stellar Ecosystem Stats

Web and API analytics for projects built on Stellar, run as a shared service for
the Stellar Community Fund (SCF). Projects get privacy-first web analytics and
OpenTelemetry-based API metrics; SCF operators get one view across every
enrolled project.

## Status

This repository currently contains the **web app** only: the public site, the
tenant dashboards and the operator console, running on demo data.

Not built yet: event ingestion, the OpenTelemetry collector, sign-in and tenant
isolation, the metrics API, and infrastructure-as-code. The UI stands in for
them as follows:

- All numbers are demo data, and every project except Skyhitz is invented.
- The Public / Tenant / Operator switch in the header replaces sign-in.
- Changes made in the UI (removing a project, generating a key, requesting
  erasure) last until the page is reloaded.

## Layout

```
apps/
  web/        Next.js app: public site, tenant dashboards, operator console
```

Services and infrastructure will sit alongside `apps/web` as they are added.
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) describes the full planned
system: ingestion, the OpenTelemetry pipeline, sign-in with Stellar, tenant
isolation, privacy handling and deployment.

## Getting started

Requires Node.js 20.9 or newer and pnpm 10.

```sh
pnpm install
pnpm dev          # http://localhost:3000
```

Other commands, all run from the repository root:

| Command | What it does |
| --- | --- |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Unit and component tests |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate route types and run TypeScript |

See [`apps/web/README.md`](apps/web/README.md) for how the app is organized.

## Deploying

The site is live at https://stellarstats.skyhitz.io, served by the Cloudflare
Worker `stellar-ecosystem-stats` (config in `apps/web/wrangler.jsonc`). Every
page is prerendered, so the deploy is a static export (`STATIC_EXPORT=1 next
build` writes `apps/web/out/`) uploaded as Workers static assets.

```sh
pnpm run deploy   # builds the static export and runs `wrangler deploy`
```

Wrangler needs to be signed in (`npx wrangler login`) or given
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Before launch

These are placeholders in the UI today:

- The domain `stellarstats.example`, the tracker script versions (`v1.4.2`,
  `v1.5.0`) and the integrity hash, in `apps/web/src/data/setup.ts`.
- The compliance statement (data residency, opt-in jurisdictions, retention)
  and the session-hash wording, in `apps/web/src/data/privacy.ts`. The UI marks
  the statement as a draft.
- The "changelog + new hash" link on the Setup screen, which has no target.
- The favicon, `apps/web/src/app/icon.svg`.

## Licence

The code in this repository is released under the [MIT License](LICENSE).

The fonts bundled in `apps/web/src/fonts` are third-party and keep their own
licence, the SIL Open Font License 1.1. Each font's licence text sits next to
its font file.
