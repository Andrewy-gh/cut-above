# React Router v7 Upgrade

Suggested split:

- Owner: Agent C
- Branch: upgrade/router7
- Merge order: 3/3 (after React 19 + RTK 2)
- Conflict note: touches client/package.json + pnpm-lock.yaml

Goal: move client routing to v7 with behavior parity.

Scope: router config, route loaders/actions (if any), tests.

Steps:

- enable v7 future flags in `createBrowserRouter` first
- fix any splat route path changes or transition timing warnings
- bump `react-router-dom` to v7
- update any deprecated imports/exports
- run tests + `pnpm test:e2e`

Risks:

- relative splat path resolution changes
- transition wrapping can affect tests timing

Done when:

- `pnpm -C client build`
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e` green
- no console warnings from router

Fallback:

- keep v6.30 with future flags if v7 blocks
