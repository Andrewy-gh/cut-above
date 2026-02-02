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
