# Scripts Guide (Index)

Use this file as the top-level map. Scenario details live in runbooks.

## Start Here

- Runbook index: `docs/runbooks/README.md`
- Local non-cloud: `docs/runbooks/local-non-cloud.md`
- Local cloud-dev: `docs/runbooks/local-cloud.md`
- Production: `docs/runbooks/production.md`
- Seed/reset details: `docs/runbooks/seed-reset.md`

## Scenario Quick Matrix

| Scenario        | Core start command                             | Seed command                           | Reset command                                                        |
| --------------- | ---------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Local non-cloud | `pnpm dev:local`                               | `pnpm seed:dev`                        | `CONFIRM_SEED_RESET=true pnpm seed:reset`                            |
| Local cloud-dev | `pnpm convex:use:cloud` + `pnpm -C client dev` | `ALLOW_CLOUD_SEED=true pnpm seed:dev`  | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset`      |
| Production      | GitHub workflow `Convex Deploy`                | `ALLOW_CLOUD_SEED=true pnpm seed:prod` | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset:prod` |

## Script Reference

- `pnpm convex:use:local`: write local Convex URLs to `.env.local`
- `pnpm convex:use:cloud`: write cloud Convex URLs to `.env.local`
- `pnpm dev:convex:local`: run local Convex backend
- `pnpm dev:convex:cloud`: run Convex dev in cloud mode
- `pnpm dev:local`: local all-in-one (Convex local + Mailpit + frontend)
- `pnpm dev:setup`: set Convex `SITE_URL` env
- `pnpm dev:setup:mailpit`: set Convex env for Mailpit delivery mode
- `pnpm email:test:resend`: send a direct Resend smoke email using `.env.resend.local`
- `pnpm seed:dev`: generate realistic seeded data (shared dev password)
- `pnpm seed:prod`: seed from `.seed-prod.json` (per-user passwords)
- `pnpm seed:reset`: clear dev seed-owned data
- `pnpm seed:reset:prod`: clear prod-seed-owned data
- `pnpm deploy:prod`: run gate, set Convex prod env, deploy Convex
