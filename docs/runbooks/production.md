# Production Runbook

Use this for production deployment and host env wiring.

## 1) Source of truth

- GitHub Secrets/Vars are source of truth.
- Workflow writes runtime values into Convex (`pnpm deploy:prod`).

## 2) Required deploy config

Required:

- `CONVEX_DEPLOY_KEY` (GitHub Secret)
- `SITE_URL` (GitHub Variable)
- `BETTER_AUTH_SECRET` (GitHub Secret)

Email today:

- If stubbing email: set `EMAIL_DELIVERY_MODE=log`
- If real SMTP: set `EMAIL_USER` and provider vars/secrets

## 3) Deploy

Preferred:

- Run GitHub workflow: `Convex Deploy` (`workflow_dispatch`)

Manual fallback:

```bash
pnpm deploy:prod
```

## 4) Frontend host env

Set on frontend platform:

- `CONVEX_DEPLOYMENT_URL` (`*.convex.cloud`)
- `CONVEX_SITE_URL` (`*.convex.site`)

Do not set `CONVEX_SITE_URL` with `convex env set`.

## 5) Optional production seed/reset

Seed:

```bash
ALLOW_CLOUD_SEED=true pnpm seed:prod
```

Reset (break-glass only):

```bash
ALLOW_CLOUD_SEED=true CONFIRM_SEED_RESET=true pnpm seed:reset:prod
```
