# Convex Migration Plan (Cut Above)

Goal: full, clean migration of frontend + backend to Convex. All existing backend routes become Convex queries/mutations/actions (Convex-native only). Frontend switches to Convex client calls. Every phase ends with lint + tests passing and a commit.

## Phase 0a - Decisions

- Confirm Better Auth + Convex integration (convex@latest, @convex-dev/better-auth, better-auth@1.4.9).
- Convex-native only: no REST endpoints or HTTP actions.
- Confirm deploy target: Vercel.

Success criteria

- Decisions recorded in plan.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase0a.md`.

## Phase 0b - Inventory + Mapping

- Inventory all API routes and UI flows.
- Map routes to Convex function list.
- Capture current test coverage and identify critical flows for minimal edge-case tests.

Success criteria

- Written route/function mapping doc.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase0b.md`.

## Phase 1a - Convex Init + Config

- Add Convex project config + `convex/` folder skeleton.
- Install Convex + Better Auth deps: `convex@latest`, `@convex-dev/better-auth`, `better-auth@1.4.9`.

Success criteria

- Convex dev server runs.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase1a.md`.

## Phase 1b - Schema + Indexes

- Add baseline `schema.ts` with tables and indexes (users, schedules, appointments, password reset tokens, email outbox/deliveries).

Success criteria

- Schema compiles.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase1b.md`.

## Phase 1c - Client Wiring + Seed Placeholder

- Add Convex dev scripts + env wiring for client.
- Add minimal seed script placeholder.

Success criteria

- Client connects to Convex locally.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase1c.md`.

## Phase 2a - Better Auth Backend Setup

- Implement Better Auth flows using Convex integration.
- Add Convex auth helpers for role checks.

Success criteria

- Auth backend working in Convex.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase2a.md`.

## Phase 2b - Frontend Auth Wiring

- Replace `authApiSlice` + session-based logic with Convex auth in the client.
- Update protected routes and user state.

Success criteria

- Login/logout + current user works.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase2b.md`.

## Phase 2c - Auth Tests

- Add minimal auth tests: login/logout + access guard.

Success criteria

- Auth tests pass.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase2c.md`.

## Phase 3a - Schedules Queries/Mutations

- Implement Convex queries/mutations for schedules.

Success criteria

- Schedule flows work.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase3a.md`.

## Phase 3b - Appointments Mutations

- Implement Convex queries/mutations for appointments.

Success criteria

- Appointment create/update/delete works.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase3b.md`.

## Phase 3c - Booking UI Swap

- Replace RTK Query booking flows (`useBooking`, appointment APIs) with Convex client calls.

Success criteria

- Book/modify/cancel appointment works end-to-end.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase3c.md`.

## Phase 3d - Booking Tests

- Add critical edge-case tests: schedule conflict, invalid employee selection, unauthorized booking.

Success criteria

- Booking tests pass.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase3d.md`.

## Phase 4a - Admin/Employee Views

- Implement admin/employee appointment views + status updates with Convex.

Success criteria

- Admin/employee views work.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase4a.md`.

## Phase 4b - Email Actions

- Replace email outbox worker with Convex actions.

Success criteria

- Email enqueue works.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase4b.md`.

## Phase 4c - Scheduling + Retry

- Replace polling worker with Convex scheduled functions + retry logic.

Success criteria

- Scheduled retries work.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase4c.md`.

## Phase 4d - Email Tests

- Add a minimal test for email enqueue + retry behavior (unit level).

Success criteria

- Email enqueue path covered with minimal test.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase4d.md`.

## Phase 5a - Remove Legacy Backend

- Remove Express/Sequelize/Redis server code and dependencies.
- Remove server docker files, migrations, and RLS policies.

Success criteria

- App runs on Convex only.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase5a.md`.

## Phase 5b - Docs + Deploy Notes

- Update README + docs for Convex dev/prod workflow.
- Ensure routes are fully migrated and no old API paths are referenced.

Success criteria

- Docs updated and ready for deployment.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase5b.md`.

## Phase 5c - Final Lint/Test Gate

- Run full gate (lint/typecheck/tests/docs).

Success criteria

- Lint + tests pass.
- Code ready for deployment.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase5c.md`.

## Seed Data Plan (Portfolio-safe)

- Users: 200 (20 admins/employees, 180 clients)
- Schedules: 365 days
- Appointments: 5,000-20,000 over last 6 months
- Email outbox: 500-1,000 sample records
- Keep avg doc size under ~2-5KB to stay well inside free-tier storage

## Critical Flow Tests (minimal)

- Auth: login/logout + access guard
- Booking: availability conflict, unauthorized booking, reschedule across dates
- Admin: status change + visibility
- Email: enqueue + retry path

## Infrastructure / Tools Needed

- Node + pnpm (existing).
- Convex CLI + project configured (Convex dev server).
- Mailpit container for email action tests.
- Optional: seeded dataset script runner (node script or convex function).
- Deployment target: Vercel.
