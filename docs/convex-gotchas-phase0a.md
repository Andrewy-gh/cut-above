# Convex Gotchas — Phase 0a

Date: 2026-02-02

## Gotchas

- Convex/Better Auth packages are not yet in any `package.json` files; add during the install phase.
- No HTTP actions or REST endpoints allowed; any integrations must use Convex queries/mutations/actions.
- Deploy target is Vercel; avoid assumptions tied to other hosts.
