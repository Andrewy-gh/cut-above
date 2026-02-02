# Convex Gotchas - Phase 2a

- Better Auth setup expects `SITE_URL` (app origin) and `CONVEX_SITE_URL` (Convex site URL) to be set in the Convex environment.
- `npx convex dev` still requires interactive login; use `CONVEX_TOKEN` for non-interactive terminals.
