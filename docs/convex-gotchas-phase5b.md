# Convex Gotchas - Phase 5b

- Legacy Express routes were removed; ensure no `/api` proxying remains in Vite config.
- Convex runtime env needs `SITE_URL` via the Convex CLI or dashboard; `CONVEX_SITE_URL` is built-in and cannot be overridden.
- Mailpit automation expects `.env.mailpit.local`; copy from `.env.mailpit.example` before running `pnpm email:test`.
