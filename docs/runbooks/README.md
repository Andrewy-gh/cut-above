# Convex Runbooks

Single source of truth for local, cloud-dev, and production workflows.

## Scenario Matrix

| Scenario        | Backend                      | Frontend | Start Convex                                | Start Client         | Mailpit                          | Seed                                   | Reset                                                                |
| --------------- | ---------------------------- | -------- | ------------------------------------------- | -------------------- | -------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Local non-cloud | Local Convex (`localhost`)   | Local    | `pnpm dev:convex:local` or `pnpm dev:local` | `pnpm -C client dev` | Optional/Recommended             | `pnpm seed:dev`                        | `CONFIRM_SEED_RESET=true pnpm seed:reset`                            |
| Local cloud-dev | Convex cloud dev deployment  | Local    | `pnpm dev:convex:cloud` (optional)          | `pnpm -C client dev` | Optional (local)                 | `ALLOW_CLOUD_SEED=true pnpm seed:dev`  | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset`      |
| Production      | Convex production deployment | Hosted   | GitHub workflow `Convex Deploy`             | Hosted platform      | Not used (use provider/log mode) | `ALLOW_CLOUD_SEED=true pnpm seed:prod` | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset:prod` |

Notes:

- Seed scripts schedule realistic appointments starting 14 days from runtime date by default.
- Cloud/prod seed and reset are guarded on purpose.

## Runbooks

- Local non-cloud: `docs/runbooks/local-non-cloud.md`
- Local cloud-dev: `docs/runbooks/local-cloud.md`
- Production deploy: `docs/runbooks/production.md`
- Seed + reset details: `docs/runbooks/seed-reset.md`
