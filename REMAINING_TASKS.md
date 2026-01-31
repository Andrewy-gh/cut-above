# Remaining Tasks (from tasks/CODEBASE_ANALYSIS.md)

## Phase 1: Foundation

- [x] Setup pnpm workspace monorepo (shared schemas package, Dockerfile update, workspace deps)

## Phase 2: Tooling

- [x] Server Prettier config (ESLint already exists; Prettier missing)
- [x] Add Husky + lint-staged
- [x] Add CI workflow
- [x] Update dependencies (start with minor/patch)

## Phase 3: Production Polish

- [x] Fix security issues
  - [x] CORS should not allow missing origin in prod
  - [x] Client API base URL should use env (VITE_API_URL)
- [x] Improve README (update live URL, add docs)
- [ ] Major dependency upgrades (React 19, MUI 6, etc.)
- [ ] MUI 6 + MUI X pickers upgrade checklist (scan 2026-01-31)
  - [x] Bump MUI deps (core 6.5.0, X pickers 7.29.4)
  - [x] Update/normalize MUI imports (remove `@mui/material/` trailing slash)
    - `client/src/components/Navbar/index.tsx`
    - `client/src/routes/BookingPage/AvailableTimes/index.tsx`
  - [ ] Verify AccordionSummary heading wrapper change (default `h3`)
    - `client/src/routes/BookingPage/EmployeeAccordion/index.tsx`
  - [ ] Date pickers migration pass (slot/prop changes, adapter)
    - `client/src/components/DatePickers/DatePicker.tsx`
    - `client/src/components/DatePickers/DateRangePicker.tsx`
    - `client/src/routes/AddSchedule/index.tsx`
    - `client/src/main.tsx`
    - `client/src/test/test-utils.tsx`
  - [ ] Theme + CssBaseline overrides sanity check
    - `client/src/styles/styles.ts`
  - [ ] Icons + core components smoke pass (visual + RTL)
    - `client/src/components/**`
    - `client/src/routes/**`
- [ ] Optional: OpenAPI docs

## Other items called out in the analysis

- [ ] Add React error boundary
- [ ] Logging improvements (request IDs, JSON in prod)
- [ ] Remove unused deps (redis package, MUI Pro, prop-types)
- [ ] Shared schema validation (replace Joi with Valibot + shared package)
- [ ] Delete user feature (backend endpoint + cascade behavior)
- [x] Cookie name consistency
- [ ] Timezone config via env
