# Convex Gotchas - Phase 2a

- Better Auth setup expects `SITE_URL` (app origin) to be set in the Convex environment; `CONVEX_SITE_URL` is built-in.
- `npx convex dev` still requires interactive login; use `CONVEX_TOKEN` for non-interactive terminals.
