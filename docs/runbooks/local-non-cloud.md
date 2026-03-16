# Local Non-Cloud Runbook

Use local Convex backend + local frontend. Optional local Mailpit.

## 1) Switch to local URLs

```bash
pnpm convex:use:local
```

Expected:

- `CONVEX_DEPLOYMENT_URL=http://localhost:3210`
- `CONVEX_SITE_URL=http://localhost:3211`

## 2) Start local stack

All-in-one:

```bash
pnpm dev:local
```

Manual:

```bash
pnpm dev:convex:local
pnpm -C client dev
```

## 3) Optional Mailpit flow

```bash
pnpm dev:setup:mailpit
pnpm email:test
```

## 4) Seed and reset

Seed:

```bash
pnpm seed:dev
```

Reset seeded data:

```bash
CONFIRM_SEED_RESET=true pnpm seed:reset
```
