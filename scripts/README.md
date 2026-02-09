# Scripts: Local vs Cloud Convex (Dev + Seed)

This repo supports two common dev shapes:

- Local stack: local Convex backend + local frontend + local Mailpit.
- Hybrid: cloud Convex backend + local frontend (optional local Mailpit).

Key idea: the frontend points at whatever is in repo-root `.env.local`.

## URLs (most confusing part)

Convex has two URLs:

- `CONVEX_DEPLOYMENT_URL`: queries/mutations (WS + function API)
  - Local default: `http://localhost:3210`
  - Cloud example: `https://<name>.convex.cloud`
- `CONVEX_SITE_URL`: HTTP actions + auth routes (Better Auth)
  - Local default: `http://localhost:3211`
  - Cloud example: `https://<name>.convex.site`

The client reads these from repo-root `.env.local` (see `client/vite.config.js` using `envDir=..`).

## One-time clone setup

1. Install deps: `pnpm install`
1. Create `.env.local`:
   - Copy `.env.example` to `.env.local`
   - Keep `CONVEX_DEPLOYMENT_URL_LOCAL` / `CONVEX_SITE_URL_LOCAL` as-is (defaults fine)
   - Fill in:
     - `CONVEX_DEPLOYMENT_URL_CLOUD`
     - `CONVEX_SITE_URL_CLOUD`
1. Optional (Mailpit): tweak `.env.mailpit.local` (or keep defaults)

Notes:

- `client/.env.local` is not where the Vite app reads Convex URLs from. Prefer repo-root `.env.local`.
- If both `.env.local` and `client/.env.local` exist and disagree, `pnpm seed` will warn.

## Switching "contracts": local backend vs cloud backend

Think of this as "which Convex deployment does the local app talk to?"

### Switch to local Convex (non-cloud)

1. `pnpm convex:use:local`
1. Start everything: `pnpm dev:local`

Or manual:

1. `pnpm dev:convex:local`
1. `pnpm -C client dev`

### Switch to cloud Convex (local frontend, cloud backend)

Prereq: `.env.local` has `CONVEX_DEPLOYMENT_URL_CLOUD` and `CONVEX_SITE_URL_CLOUD`.

1. `pnpm convex:use:cloud`
1. Start Convex dev (cloud) + frontend:
   - Convex: `pnpm dev:convex:cloud`
   - Frontend: `pnpm -C client dev`

If you only want local frontend against cloud (no `convex dev` running), you can just:

1. `pnpm convex:use:cloud`
1. `pnpm -C client dev`

## What each script does

### `convex-use.mjs`

Writes repo-root `.env.local`:

- `pnpm convex:use:local`: sets `CONVEX_DEPLOYMENT_URL`/`CONVEX_SITE_URL` to local defaults (or `*_LOCAL` overrides)
- `pnpm convex:use:cloud`: sets `CONVEX_DEPLOYMENT_URL`/`CONVEX_SITE_URL` from `*_CLOUD`

### `dev-local.mjs` (`pnpm dev:local`)

Dev "easy button":

- Forces local Convex URLs: runs `pnpm convex:use:local`
- Starts Mailpit: `docker compose up -d mailpit`
- Starts Convex local dev: `pnpm dev:convex:local`
- Tries to set Convex runtime env for Mailpit: `pnpm dev:setup:mailpit ...` (retries)
- Starts frontend: `pnpm -C client dev`

Flags:

- `pnpm dev:local -- --backend-only`: do not start the frontend
- `pnpm dev:local -- --site-url http://localhost:5173`: override `SITE_URL` used for links in emails

### `dev-setup.mjs`

Sets Convex runtime env: `SITE_URL` (via `pnpm dlx convex env set SITE_URL ...`).

### `dev-setup-mailpit.mjs`

Sets Convex runtime env for local email testing:

- `SITE_URL`
- `MAILPIT_URL`
- `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_SECURE`/`EMAIL_USER`
- `EMAIL_DELIVERY_MODE=mailpit_http`

Be careful: this writes to whichever Convex deployment your CLI is currently targeting.

### `dev-stop.mjs`

Best-effort cleanup:

- Windows: kills `node.exe` processes with command line matching `cut-above`, plus `convex-local-backend`
- Non-Windows: `pkill -f cut-above`, plus `pkill -f convex-local-backend`

### `seed.ts` (`pnpm seed`)

Seeds the Convex deployment at `CONVEX_DEPLOYMENT_URL`.

Safety:

- Refuses cloud seeding unless `ALLOW_CLOUD_SEED=true`

Common usage:

- Local: `pnpm convex:use:local && pnpm seed`
- Cloud: `pnpm convex:use:cloud && $env:ALLOW_CLOUD_SEED=\"true\"; pnpm seed`

Extras:

- `SEED_PASSWORD` (defaults to `Strongpassword123!`)

### `mailpit-email-test.mjs` (`pnpm email:test`)

Brings up Mailpit, runs the Mailpit integration test, then tears Mailpit down.

## Quick commands (copy/paste)

- Full local stack: `pnpm dev:local`
- Local seed: `pnpm seed`
- Switch to cloud backend: `pnpm convex:use:cloud`
- Cloud seed (explicit): `$env:ALLOW_CLOUD_SEED=\"true\"; pnpm seed`
- Stop dev processes: `pnpm dev:stop`
