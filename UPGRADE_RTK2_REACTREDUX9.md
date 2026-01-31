# RTK 2 + React-Redux 9 Upgrade

Suggested split:

- Owner: Agent B
- Branch: upgrade/rtk2
- Merge order: 2/3 (after React 19, before Router v7)
- Conflict note: touches client/package.json + pnpm-lock.yaml

Goal: upgrade Redux Toolkit + React-Redux with minimal behavior change.

Scope: client store, slices, API slices, hooks.

Steps:

- bump deps: `@reduxjs/toolkit@^2`, `react-redux@^9`
- update `configureStore` middleware option to callback form
- convert any `extraReducers` object syntax to builder callback
- fix middleware typing changes (`unknown` action)
- run through API slice types if errors surface
- run tests + `pnpm test:e2e`

Risks:

- middleware type errors; thunks with `any` payloads
- store typing regressions (RootState, AppDispatch)

Done when:

- `pnpm -C client build`
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e` green

Fallback:

- pin RTK 1.9 + React-Redux 8 if any blocker; capture error + file/line
