# Migration Decisions — Phase 0a

Date: 2026-02-02

## Decisions

### 1) Auth + Convex integration packages

Decision: Use `convex@latest`, `@convex-dev/better-auth`, and `better-auth@1.4.9`.

Rationale:

- Align with the official Better Auth + Convex integration package.
- Stay current with Convex APIs by tracking `convex@latest`.
- Pin `better-auth` to `1.4.9` for known compatibility during migration.

Alternatives considered:

- Pin a specific Convex version (rejected: increases drift from docs/examples).
- Use a different auth stack (rejected: migration scope and ecosystem fit).

Notes:

- Current workspace `package.json` files do not yet include Convex or Better Auth packages; will be added in later phases.

### 2) Convex-native only (no REST/HTTP actions)

Decision: No REST endpoints or HTTP actions. All backend functions will be Convex queries/mutations/actions.

Rationale:

- Single execution model and consistent data access patterns.
- Reduced surface area and fewer deployment paths.

Alternatives considered:

- Convex HTTP actions for external integrations (rejected: keep backend fully Convex-native).
- Standalone REST API (rejected: increases infra complexity).

### 3) Deploy target

Decision: Deploy to Vercel.

Rationale:

- Standard hosting target for the frontend and Convex projects.
- Simplifies deployment and preview workflows.

Alternatives considered:

- Fly.io or other container hosts (rejected: not the target for this migration).
