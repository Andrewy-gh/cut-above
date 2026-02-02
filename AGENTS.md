# AGENTS Notes

Use this file to record trouble encountered at the end of each migration phase.

## Phase 0

- Phase 0a: server tests fail without DATABASE_URL (.env.test); TypeError "The \"url\" argument must be of type string. Received undefined" from server/src/utils/db.ts.
- Phase 0b: client calls `/api/user` (GET/DELETE) and `PUT /api/schedules/:id`, but server only exposes `/api/users` (GET) and no schedule update route; `GET /api/auth/logout` has side effects (session destroy).

## Phase 1

- none

## Phase 2

- none

## Phase 3

- none

## Phase 4

- none

## Phase 5

- none
