# React 19 Upgrade

Suggested split:

- Owner: Agent A
- Branch: upgrade/react19
- Merge order: 1/3 (before RTK + Router)
- Conflict note: touches client/package.json + pnpm-lock.yaml

Goal: move client to React 19 + react-dom 19; keep UI stable.

Scope: client app + types + build/runtime only.

Steps:

- bump deps: `react`, `react-dom`, `@types/react`, `@types/react-dom`
- check `StrictMode` double-invoke impacts
- verify any `useId` / `useSyncExternalStore` usage
- scan for deprecated/removed APIs (legacy context, string refs, findDOMNode)
- update any `react-dom/client` or hydration usage if needed
- run tests + `pnpm test:e2e`

Risks:

- Suspense/transition timing changes; subtle state timing issues
- 3rd-party lib compatibility (check MUI 6, router, RTK)

Done when:

- `pnpm -C client build`
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e` green
- smoke: Home + Booking page render; date picker opens

Fallback:

- pin React 18.3 if any blocker; capture error + file/line
