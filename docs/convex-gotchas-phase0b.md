# Convex Gotchas - Phase 0b

- Express session auth + Redis store: server relies on cookie session (`cutabove`) and `req.session.userRole/isAdmin`; Convex needs explicit auth + role lookup per request.
- Postgres RLS context: `dbContext` sets `app.current_user_role/id` via `set_config`; Convex must enforce access control in queries/mutations.
- UTC timestamp strictness: booking schema requires `Z`-suffix ISO strings; booking/conflict logic depends on UTC normalization.
- Transaction + email enqueue coupling: appointment create/modify/cancel uses DB transaction + email outbox enqueue; in Convex split mutation + action but keep idempotency.
- Email outbox worker: polling, dedupe keys, retries, delivery tracking (EmailOutbox + EmailDelivery). Map to Convex actions/cron with retry logic.
- GET /api/auth/logout has side effects (session destroy, cookie clear); should be mutation in Convex even though HTTP GET.
- Client/server route mismatches: client calls `/api/user` (GET/DELETE) and `PUT /api/schedules/:id` but server only supports `/api/users` (GET) and no schedule update route.
- `/api/schedules` returns nested appointments + employees/clients; Convex may need denormalized views or join-style query composition.
- Swagger docs routes are Express-specific (`/api/docs`); may be dropped or replaced.
