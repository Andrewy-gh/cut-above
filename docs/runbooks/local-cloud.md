# Local Cloud-Dev Runbook

Use Convex cloud dev backend + local frontend.

## 1) Configure cloud URLs once

In repo root `.env.local`, set:

- `CONVEX_DEPLOYMENT_URL_CLOUD=...`
- `CONVEX_SITE_URL_CLOUD=...`

## 2) Switch client to cloud URLs

```bash
pnpm convex:use:cloud
```

## 3) Run frontend (and optional cloud dev watcher)

Frontend only:

```bash
pnpm -C client dev
```

With cloud dev watcher:

```bash
pnpm dev:convex:cloud
pnpm -C client dev
```

## 4) Optional Mailpit (local only)

You can still run local Mailpit for local testing:

```bash
pnpm dev:setup:mailpit
pnpm email:test
```

## 5) Seed and reset on cloud dev

Both operations are guarded.

Seed:

```bash
ALLOW_CLOUD_SEED=true pnpm seed:dev
```

Local-cloud `seed:dev` also reads users from `.seed-prod.example.json` and uses the shared dev password `Strongpassword123!` unless `SEED_PASSWORD` overrides it.

Reset:

```bash
ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset
```
