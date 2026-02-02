# Convex Migration Plan (Cut Above)

Goal: full, clean migration of frontend + backend to Convex. All existing backend routes become Convex queries/mutations/actions (or HTTP actions only if explicitly needed). Frontend switches to Convex client calls. Every phase ends with lint + tests passing and a commit.

## Phase 0 - Decisions + Baseline Inventory

- Decide auth provider and approach (Convex Auth vs Clerk/Auth0) and how to handle password reset.
- Decide whether to keep any HTTP actions for REST compatibility or go Convex-native only.
- Inventory all API routes and UI flows; map to Convex function list.
- Capture current test coverage and identify critical flows for minimal edge-case tests.

Success criteria

- Written route/function mapping doc.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase0.md`.

## Phase 1 - Convex Scaffolding + Repo Wiring

- Add Convex project config + `convex/` folder skeleton.
- Add baseline `schema.ts` with tables and indexes (users, schedules, appointments, password reset tokens, email outbox/deliveries).
- Add Convex dev scripts + env wiring for client.
- Add minimal seed script placeholder.

Success criteria

- Convex dev server runs.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase1.md`.

## Phase 2 - Auth + User Accounts (Frontend + Backend)

- Implement auth flows using chosen provider.
- Add Convex auth helpers for role checks.
- Replace `authApiSlice` + session-based logic with Convex auth in the client.
- Update protected routes and user state.

Success criteria

- Login/logout + current user works.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase2.md`.

## Phase 3 - Scheduling + Booking (Core Flow)

- Implement Convex queries/mutations for schedules and appointments.
- Replace RTK Query booking flows (`useBooking`, appointment APIs) with Convex client calls.
- Add critical edge-case tests: schedule conflict, invalid employee selection, unauthorized booking.

Success criteria

- Book/modify/cancel appointment works end-to-end.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase3.md`.

## Phase 4 - Admin/Employee Dashboards + Email Outbox

- Implement admin/employee appointment views + status updates with Convex.
- Replace email outbox worker with Convex actions + scheduled functions.
- Update UI to use new data sources.
- Add a minimal test for email enqueue + retry behavior (unit level).

Success criteria

- Admin status updates + employee views work.
- Email enqueue path covered with minimal test.
- Lint + tests pass.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase4.md`.

## Phase 5 - Cleanup + Deletion of Legacy Backend

- Remove Express/Sequelize/Redis server code and dependencies.
- Remove server docker files, migrations, and RLS policies.
- Update README + docs for Convex dev/prod workflow.
- Ensure routes are fully migrated and no old API paths are referenced.

Success criteria

- App runs on Convex only.
- Lint + tests pass.
- Docs updated and ready for deployment.
- Commit.

Notes

- Add any trouble notes to `AGENTS.md`.
- Add gotchas to `docs/convex-gotchas-phase5.md`.

## Seed Data Plan (Portfolio-safe)

- Users: 200 (20 admins/employees, 180 clients)
- Schedules: 365 days
- Appointments: 5,000-20,000 over last 12 months
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
- Email provider credentials for action tests (or stub/console transport).
- Optional: seeded dataset script runner (node script or convex function).
