# Client TypeScript Type Safety Cleanup Strategy

This document outlines the strategy for resolving the `@ts-expect-error` suppressions introduced during the mass migration from JavaScript to TypeScript using `ts-migrate`.

## Current State Assessment

We have stabilized the infrastructure and resolved the most critical "Cannot find module" errors. The foundation is now ready for incremental component-level cleanup.

## Step-by-Step Resolution Plan

### Phase 1: Infrastructure & Global Fixes (COMPLETED ✅)

- [x] **Add Type Check Script:** Added `"typecheck": "tsc --noEmit"` to `client/package.json`.
- [x] **Install Type Definitions:** Installed `@types/react`, `@types/react-dom`, `@types/prop-types`, and `@types/node`.
- [x] **Bulk Extension Fix:** Standardized internal imports by removing legacy `.js` and `.jsx` extensions across core files.
- [x] **Resolve Configuration Conflicts:** Removed redundant `src/tsconfig.json` that was causing module resolution failures.
- [x] **CSS Module Support:** Created `src/vite-env.d.ts` with global declarations for CSS modules.

### Phase 2: Core Library & Hook Standardization (IN PROGRESS 🏗️)

- [x] **`main.tsx` & `App.tsx` Cleanup:**
  - Fixed root element selection with non-null assertion.
  - Updated environment checks to use `import.meta.env`.
- [x] **Hook Type Alignment:**
  - Updated `useNotification` signature to support multi-argument `handleError` calls.
  - Fixed related usage in `useAuth`.
- [x] **Core Layout fix:** Standardized imports and resolved CSS module type errors in `Layout/index.tsx`.
- [ ] **Next Step:** Properly type API response structures in `authApiSlice` and `notificationSlice` to replace remaining `any` types.

### Phase 3: Incremental Component Cleanup (NOT STARTED 📅)

1.  **Shared Components:** Audit `client/src/components/` (e.g., `Navbar`, `Footer`, `Overlay`) and remove suppressions.
2.  **Route-by-Route Migration:** Tackle features iteratively:
    - **Priority 1:** `Login`, `Register` (Authentication flow).
    - **Priority 2:** `BookingPage` (Complex state/prop types).
    - **Priority 3:** `Dashboard` and `Schedule` views.
3.  **Type Refinement:**
    - Replace `any` with specific interfaces.
    - Type React event handlers and hooks.
    - Eliminate `PropTypes` usage in favor of TypeScript interfaces.

## Verification Workflow

Every update should:

1.  Run `npm run typecheck` to monitor error count reduction.
2.  Ensure `npm run build` succeeds.

## Handover Notes for Next Agent

- The primary infrastructure blocks are gone. `tsc` now successfully scans the project but reports many component-level type errors.
- Start with `client/src/routes/Login/index.tsx` – it has several `any` props and MUI component type mismatches that need refining.
- Use `import.meta.env` for any environment-specific logic.
