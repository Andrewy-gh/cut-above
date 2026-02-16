# Production Deploy Checklist

Use this when promoting to production.

## 1) Export required environment variables in your shell

Minimum required:

- `SITE_URL` (public frontend origin, e.g. `https://app.example.com`)
- `BETTER_AUTH_SECRET` (strong random secret)
- `EMAIL_USER` (from/reply mailbox used by app; required unless `EMAIL_DELIVERY_MODE=log`)

Email provider config (pick one mode):

- Service mode:
  - `EMAIL_SERVICE`
  - `EMAIL_PASSWORD`
- Host mode:
  - `EMAIL_HOST`
  - Optional: `EMAIL_PORT`
  - Optional: `EMAIL_SECURE`
  - Optional: `EMAIL_PASSWORD`

Optional:

- `EMAIL_DELIVERY_MODE` (defaults to `log`)
  - Set `EMAIL_DELIVERY_MODE=log` to temporarily disable outbound email delivery while keeping the app functional.

## 2) Run one command

```bash
pnpm deploy:prod
```

What it does:

1. Runs full preflight gate: install, lint, typecheck, tests, build.
2. Sets required Convex production env vars via `convex env set ... --prod`.
3. Deploys Convex production with `convex deploy -y`.

## 3) Set frontend production env on your host

Set these in the frontend hosting platform:

- `CONVEX_DEPLOYMENT_URL` (your production `.convex.cloud` URL)
- `CONVEX_SITE_URL` (your production `.convex.site` URL)

Important: do not try to set `CONVEX_SITE_URL` via `convex env set`; it is deployment-provided by Convex.

## 4) Post-deploy smoke test

- `GET /api/auth/get-session` returns `200` or `401` (not `500`)
- Signup/login/logout
- Create/modify/cancel appointment
- Submit contact form and confirm email outbox delivery

## 5) Frontend deployment source

Frontend deployment is handled by the Vercel Git integration (not GitHub Actions).
Repo defaults are in `vercel.json`:

- `installCommand`: `pnpm install --frozen-lockfile`
- `buildCommand`: `pnpm -C client build`
- `outputDirectory`: `client/dist`
- SPA fallback is configured to serve `index.html` for deep links (`vercel.json` and `client/vercel.json`).
