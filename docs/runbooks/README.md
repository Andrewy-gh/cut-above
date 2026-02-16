# Convex Runbooks

Single source of truth for local, cloud-dev, and production workflows.

## Environment Matrix

| Scenario        | Backend                      | Frontend | Mail pit                         |
| --------------- | ---------------------------- | -------- | -------------------------------- |
| Local non-cloud | Local Convex (`localhost`)   | Local    | Optional/Recommended             |
| Local cloud-dev | Convex cloud dev deployment  | Local    | Optional (local)                 |
| Production      | Convex production deployment | Hosted   | Not used (use provider/log mode) |

## Startup Matrix

| Scenario        | Start Convex                                | Start Client         |
| --------------- | ------------------------------------------- | -------------------- |
| Local non-cloud | `pnpm dev:convex:local` or `pnpm dev:local` | `pnpm -C client dev` |
| Local cloud-dev | `pnpm dev:convex:cloud` (optional)          | `pnpm -C client dev` |
| Production      | GitHub workflow `Convex Deploy`             | Hosted platform      |

## Data Matrix

| Scenario        | Seed                                   | Reset                                                                |
| --------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Local non-cloud | `pnpm seed:dev`                        | `CONFIRM_SEED_RESET=true pnpm seed:reset`                            |
| Local cloud-dev | `ALLOW_CLOUD_SEED=true pnpm seed:dev`  | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset`      |
| Production      | `ALLOW_CLOUD_SEED=true pnpm seed:prod` | `ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset:prod` |

Notes:

- Seed scripts schedule realistic appointments starting 14 days from runtime date by default.
- Cloud/prod seed and reset are guarded on purpose.

## Runbooks

- Local non-cloud: `docs/runbooks/local-non-cloud.md`
- Local cloud-dev: `docs/runbooks/local-cloud.md`
- Production deploy: `docs/runbooks/production.md`
- Seed + reset details: `docs/runbooks/seed-reset.md`
