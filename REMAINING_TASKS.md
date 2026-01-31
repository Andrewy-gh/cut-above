# Remaining Tasks (from tasks/CODEBASE_ANALYSIS.md)

## Phase 1: Foundation
- [x] Setup pnpm workspace monorepo (shared schemas package, Dockerfile update, workspace deps)

## Phase 2: Tooling
- [x] Server Prettier config (ESLint already exists; Prettier missing)
- [x] Add Husky + lint-staged
- [x] Add CI workflow
- [x] Update dependencies (start with minor/patch)

## Phase 3: Production Polish
- [ ] Fix security issues
  - [x] CORS should not allow missing origin in prod
  - [x] Client API base URL should use env (VITE_API_URL)
- [ ] Improve README (update live URL, add docs)
- [ ] Major dependency upgrades (React 19, MUI 6, etc.)
- [ ] Optional: OpenAPI docs

## Other items called out in the analysis
- [ ] Add React error boundary
- [ ] Logging improvements (request IDs, JSON in prod)
- [ ] Remove unused deps (redis package, MUI Pro, prop-types)
- [ ] Shared schema validation (replace Joi with Valibot + shared package)
- [ ] Delete user feature (backend endpoint + cascade behavior)
- [x] Cookie name consistency
- [ ] Timezone config via env
