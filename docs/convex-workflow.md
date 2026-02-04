# Convex Dev + Deploy Workflow

## Local development

1. Install dependencies:
   `pnpm install`

2. Start Convex dev:
   `pnpm dev:convex`

3. Set client env:
   Copy `.env.example` to `.env.local` and set `CONVEX_DEPLOYMENT_URL` and `CONVEX_SITE_URL` from the Convex dev output.
   The client reads the repo-root `.env.local` (no `client/.env.local`).

4. Set Convex runtime env (Better Auth + emails):
   - `SITE_URL`: your client origin (for local dev: `http://localhost:5173`).
   - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`: SMTP config for the email action.

   Use the CLI (one time per deployment):
   `pnpm dev:setup`

5. Run the client:
   `pnpm -C client dev`

## Email delivery testing (Mailpit)

1. Copy `.env.mailpit.example` to `.env.mailpit.local`.
2. Run `pnpm email:test`.

This starts Mailpit, sends an outbox email through SMTP, verifies delivery via the Mailpit API, and then shuts down the container.

## Deploy

1. Deploy Convex functions:
   `pnpm dlx convex deploy`
2. Set production Convex env vars (`CONVEX_SITE_URL`, `SITE_URL`, and email credentials) via the Convex dashboard or CLI.
3. Deploy the client (any static host) with `CONVEX_DEPLOYMENT_URL` configured at build time.
