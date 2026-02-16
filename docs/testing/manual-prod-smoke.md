# Manual Production Smoke Test

Use this checklist after each production deploy.

## Preconditions

- [ ] Frontend host env is set:
  - `CONVEX_DEPLOYMENT_URL` -> production `*.convex.cloud`
  - `CONVEX_SITE_URL` -> production `*.convex.site`
- [ ] Convex production env has `SITE_URL` set to the frontend origin.
- [ ] `EMAIL_DELIVERY_MODE=log` is set (or intentionally configured for real SMTP).

## 1) Auth endpoint health

- [ ] Run:

```bash
curl -i https://impressive-mongoose-323.convex.site/api/auth/get-session
```

- [ ] Response is `200` or `401` (not `500`).

## 2) Guest smoke

- [ ] Open production frontend home page.
- [ ] Open booking page and verify employees/time slots load.
- [ ] Navigate to a protected route (example: `/account`) while logged out and confirm redirect to login.

## 3) Client smoke

- [ ] Login with a seeded client user from `.seed-prod.json`.
- [ ] Create an appointment.
- [ ] Modify that appointment.
- [ ] Cancel that appointment.
- [ ] Verify appointment list reflects each change.

## 4) Admin smoke

- [ ] Login with a seeded admin user.
- [ ] Verify admin-only routes/pages are accessible.
- [ ] Verify non-admin cannot access admin-only routes.

## 5) Email/outbox smoke (log mode)

- [ ] Submit contact form.
- [ ] Trigger at least one appointment flow that queues email.
- [ ] In Convex dashboard, verify rows are created in:
  - `emailOutbox`
  - `emailDeliveries`
- [ ] Verify outbox entries do not remain stuck in `processing`.

## 6) Seed sanity

- [ ] Seeded schedule starts about 14 days after seed runtime.
- [ ] Future appointments exist across multiple weeks.
- [ ] No obviously broken records (missing users, missing employee links, invalid schedule references).

## Pass/Fail

- [ ] Pass all sections above.
- [ ] If anything fails, capture:
  - exact step
  - URL
  - error text
  - browser timestamp
