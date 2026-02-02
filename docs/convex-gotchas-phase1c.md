# Convex Gotchas — Phase 1c

- `convex/client.ts` sits at repo root; TypeScript resolves `convex/react` from the root, so the root package needs the `convex` dependency (or re-export from a client-local module).
- Root `pnpm test` runs client Vitest in watch mode; use `pnpm test:run` for CI-style runs.
