# Convex Gotchas - Phase 5b

- Legacy Express routes were removed; ensure no `/api` proxying remains in Vite config.
- Convex runtime env (`CONVEX_SITE_URL`, `SITE_URL`) must be set via the Convex CLI or dashboard, not just `.env.local`.
- Mailpit automation expects `.env.mailpit.local`; copy from `.env.mailpit.example` before running `pnpm email:test`.
