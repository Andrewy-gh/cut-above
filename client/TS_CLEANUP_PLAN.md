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

### Phase 2: Core Library & Hook Standardization (COMPLETED ✅)

- [x] **`main.tsx` & `App.tsx` Cleanup:**
  - Fixed root element selection with non-null assertion.
  - Updated environment checks to use `import.meta.env`.
- [x] **Hook Type Alignment:**
  - Updated `useNotification` signature to support multi-argument `handleError` calls.
  - Fixed related usage in `useAuth`.
- [x] **Core Layout fix:** Standardized imports and resolved CSS module type errors in `Layout/index.tsx`.
- [x] **Standardized `apiSlice`:** Standardized `apiSlice` with proper `tagTypes` and `import.meta.env`.
- [x] **Type API responses:** Properly typed all core slices (`authApiSlice`, `notificationSlice`, `apptApiSlice`, `userSlice`, `employeeSlice`, `scheduleSlice`) to replace `any` types.

### Phase 3: Incremental Component Cleanup (IN PROGRESS 🏗️)

- [x] **Shared Components:** Audited and cleaned up `client/src/components/` (e.g., `Navbar`, `Footer`, `Overlay`, `ApptCard`, `CustomDialog`, `PasswordInput`).
  - Replaced `PropTypes` with TypeScript interfaces.
  - Removed redundant `@ts-expect-error` suppressions.
  - Centralized core types in `client/src/types/index.ts`.

2.  **Route-by-Route Migration:** Tackle features iteratively:
    - [x] **Priority 1 (High):** `Login`, `Register` (Cleaned up `any` props, fixed state initialization, and removed redundant suppressions).
    - [x] **Priority 2:** `BookingPage` (Fully typed. Standardized component props, centralized `Slot` and `GenericResponse` types, and removed all redundant suppressions).
    - [x] **Priority 3:** `Dashboard` and `Schedule` views (Fully typed `AddSchedule`, `DashboardSchedule`, and `DashboardAppointment`. Standardized `Schedule` and `Appointment` interfaces).
3.  **Type Refinement:**
    - Replace remaining `any` in component props with specific interfaces.
    - Standardize React event handlers and hooks.
    - Systematically eliminate `PropTypes` usage (referencing `utils/propTypes.ts`) in favor of TypeScript interfaces.

## Verification Workflow

Every update should:

1.  Run `npm run typecheck` to monitor error count reduction.
2.  Ensure `npm run build` succeeds.

## Handover Notes for Next Agent

- **Progress Update:** All `@ts-expect-error` directives removed. Typecheck 0 errors. Build succeeds. Reduced `any` from ~60 to ~35.
- **Completed:**
  - Added `EmployeeProfile` type, updated `employeeSlice`.
  - Cleaned all route suppressions: `RequireAuth`, `ResetPw`, `Settings/*`, `TokenValidation`.
  - Fixed `vite.config.js` extensions and `index.html` entry point.
  - Typed `utils/password.ts`, `utils/email.ts`, `utils/date.ts`.
  - Typed event handlers in `Settings` and `ResetPw` routes.
  - Typed `useAuth` hook parameters.
- **Remaining `any` (~35):**
  - Selectors using `(state: any)` - acceptable due to circular dependency.
  - `utils/apptStatus.ts`, `utils/navigation.ts` - needs typing.
  - `useNotification`, `useFilter`, hooks with selectors.
  - Some BookingPage and DashboardAppointment handlers.
- **Architecture Note:** Use `import.meta.env` for environment logic.
- **Circular Dependencies:** Use `(state: any)` in selector definitions as bridge.
