# AGENTS Notes

Context: track migration issues as they are discovered; append new bullets under the active phase.

Use this file to record trouble encountered at the end of each migration phase.

## Phase 0

- Phase 0a: server tests fail without DATABASE_URL (.env.test); TypeError "The \"url\" argument must be of type string. Received undefined" from server/src/utils/db.ts.
- Phase 0b: client calls `/api/user` (GET/DELETE) and `PUT /api/schedules/:id`, but server only exposes `/api/users` (GET) and no schedule update route; `GET /api/auth/logout` has side effects (session destroy).

## Phase 1

- Phase 1a: `npx convex init` is deprecated; CLI requires `npx convex dev --once --configure=new`.
- Phase 1a: use `pnpm dlx convex dev` (or `pnpm dlx convex dev --once --configure=new`) in pnpm workspaces.
- Phase 1a: Convex CLI cannot prompt for login in this non-interactive environment, so `npx convex dev` fails with: "Cannot prompt for input in non-interactive terminals. (Welcome to Convex! Would you like to login to your account?)".
- Phase 1a: Configured Convex token from user-provided token file.
- Phase 1b: `npx convex dev --once --configure=new` still fails in non-interactive terminals with: "Cannot prompt for input in non-interactive terminals. (Welcome to Convex! Would you like to login to your account?)".
- Phase 1b: `pnpm test` fails in server suites without DATABASE_URL (.env.test); TypeError "The \"url\" argument must be of type string. Received undefined" from server/src/utils/db.ts.
- Phase 1c: `convex/client.ts` lives at repo root; TypeScript resolves `convex/react` from the root so the root package needs the `convex` dependency (or re-export from a client-local module).
- Phase 1c: root `pnpm test` runs client Vitest in watch mode; use `pnpm test:run` for CI-style runs.
- Phase 1d: Convex push failed with duplicate auth providers for applicationID "convex", reserved index name "by_id", and Better Auth createClient now requiring authFunctions for triggers; Convex tsc needed @types/node and requireQueryCtx from `@convex-dev/better-auth/utils`.

## Phase 2

- none

## Phase 3

- Phase 3d: added convex-tests workspace using convex-test + Better Auth component registration for appointment edge-case coverage.

## Phase 4

- none

## Phase 5

- Phase 5b/5c: Convex-only docs updated; full gate run (lint/typecheck/tests/docs). Mailpit email automation documented.
- Phase 5d: Frontend error page currently shows raw error messages; may need to sanitize/replace with user-friendly copy to avoid leaking internal details.
- Phase 5e (local dev auth/email): fixed local Convex Windows ESM loader spam from email outbox by routing local email delivery through Mailpit HTTP (`EMAIL_DELIVERY_MODE=mailpit_http`) and moving SMTP delivery into a separate `"use node"` action (`convex/emailOutboxNodeActions.ts`).
- Phase 5e (local dev auth): fixed "Backend unreachable" / "Something went wrong" auth flows by correcting local URL split: `CONVEX_DEPLOYMENT_URL` should be `http://localhost:3210` and `CONVEX_SITE_URL` (HTTP actions/auth) should be `http://localhost:3211` (updated `scripts/convex-use.mjs`, `.env.example`, `scripts/dev-local.mjs`).
- Phase 5e (Better Auth): `GET http://localhost:3211/api/auth/get-session` was returning 500 with `BetterAuthError: You are using the default secret...`; fixed by passing `secret` into Better Auth config from `BETTER_AUTH_SECRET` and providing a local-dev fallback (`convex/auth.ts`).
- Phase 5e (UX): added guard to clear persisted Redux auth when Better Auth session is null to avoid "phantom logged-in" UI (`client/src/hooks/useAuth.ts`).
- Phase 5e (ops): `scripts/dev-stop.mjs` now also stops `convex-local-backend` so port `3210` doesn't remain bound between runs.
- Phase 5e (convex env): `pnpm dlx convex env set CONVEX_SITE_URL ...` fails with `EnvVarNameForbidden` because `CONVEX_SITE_URL` is built-in and cannot be overridden; treat it as deployment-provided, not app-configured.
- Phase 5f (seed alignment): local dev login/test data in server/src/utils/data.ts should be aligned with projects/cut-above/.seed-prod.example.json to keep environment credentials/data consistent across seed flows.

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->
