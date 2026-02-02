# AGENTS Notes

Use this file to record trouble encountered at the end of each migration phase.

## Phase 0

- Phase 0a: server tests fail without DATABASE_URL (.env.test); TypeError "The \"url\" argument must be of type string. Received undefined" from server/src/utils/db.ts.
- Phase 0b: client calls `/api/user` (GET/DELETE) and `PUT /api/schedules/:id`, but server only exposes `/api/users` (GET) and no schedule update route; `GET /api/auth/logout` has side effects (session destroy).

## Phase 1

- Phase 1a: `npx convex init` is deprecated; CLI requires `npx convex dev --once --configure=new`.
- Phase 1a: Convex CLI cannot prompt for login in this non-interactive environment, so `npx convex dev` fails with: "Cannot prompt for input in non-interactive terminals. (Welcome to Convex! Would you like to login to your account?)".

## Phase 2

- none

## Phase 3

- none

## Phase 4

- none

## Phase 5

- none
