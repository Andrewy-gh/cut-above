# Convex Gotchas - Phase 2b

- Better Auth client must be configured with `CONVEX_SITE_URL` so `createAuthClient` points to the Convex `/api/auth` routes.
- Password reset now uses `/resetpw?token=...` from Better Auth; the old `/resetpw/:id/:token` flow is removed.
- Change password now requires the current password to satisfy Better Auth's `change-password` endpoint.
- Session `freshAge` is set to `0` to avoid delete-user freshness errors during migration; revisit for production.
