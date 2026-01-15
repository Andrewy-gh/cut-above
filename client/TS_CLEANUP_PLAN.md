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

### Phase 3: Incremental Component Cleanup (COMPLETED ✅)

- [x] **Shared Components:** Audited and cleaned up `client/src/components/` (e.g., `Navbar`, `Footer`, `Overlay`, `ApptCard`, `CustomDialog`, `PasswordInput`).
  - Replaced `PropTypes` with TypeScript interfaces.
  - Removed redundant `@ts-expect-error` suppressions.
  - Centralized core types in `client/src/types/index.ts`.

- [x] **Route-by-Route Migration:** Tackle features iteratively:
    - [x] **Priority 1 (High):** `Login`, `Register` (Cleaned up `any` props, fixed state initialization, and removed redundant suppressions).
    - [x] **Priority 2:** `BookingPage` (Fully typed. Standardized component props, centralized `Slot` and `GenericResponse` types, and removed all redundant suppressions).
    - [x] **Priority 3:** `Dashboard` and `Schedule` views (Fully typed `AddSchedule`, `DashboardSchedule`, and `DashboardAppointment`. Standardized `Schedule` and `Appointment` interfaces).

- [x] **Type Refinement:**
    - [x] Replaced remaining `any` in utils and hooks with specific interfaces.
    - [x] Standardized React event handlers across routes.
    - [x] Typed all major handlers in `BookingPage`, `ContactUs`, `DashboardAppointment`.

## Verification Workflow

Every update should:

1.  Run `npm run typecheck` to monitor error count reduction.
2.  Ensure `npm run build` succeeds.

## Handover Notes for Next Agent

### Current Status
- **Typecheck:** ✅ 0 errors
- **Build:** ✅ Succeeds
- **Any Count:** ~15 (down from ~60 originally, ~27 this session)
- **All `@ts-expect-error` directives:** ✅ Removed

### Latest Session Changes (Type Refinement)

**Utils Typed:**
- `utils/apptStatus.ts` - Added `Appointment[]` input, `AppointmentStatusGroup[]` output
- `utils/navigation.ts` - Added `NavLink`, typed user/role params

**Hooks Typed:**
- `hooks/useNotification.ts` - Replaced `any` with `ApiError | string` for error handling
- `hooks/useFilter.ts` - Typed employee selection, service handling

**New Types Added to `types/index.ts`:**
- `Service` - Service data structure from data.ts
- `NavLink` - Navigation link structure
- `AppointmentStatusGroup` - Grouped appointments by status
- `ApiError` - API error response structure
- `ContactDetails` - Contact form data

**Components/Routes Typed:**
- `components/Navbar/DrawerMenu` - Removed `any` from navigation map
- `routes/BookingPage/BookingForm` - Typed `handleOpen` with `Slot`
- `routes/BookingPage/ServiceSelect` - Removed `any` from services map
- `routes/BookingPage/EmployeeEdit` - Removed index signature
- `routes/BookingPage/index.tsx` - Typed `handleSelectAndOpen`
- `routes/DashboardAppointment` - Typed status filtering
- `routes/Home/ContactUs` - Typed event handlers properly

**Slices Fixed:**
- `features/emailSlice.ts` - Added `ContactDetails` interface
- `features/auth/authApiSlice.ts` - Fixed `validateToken` return type
- `features/scheduleSlice.ts` - Removed `any` from appointment mapping
- `data/data.ts` - Typed arrays as `NavLink[]` and `Service[]`

### Phase 4: RootState Typing & Final Cleanup (COMPLETED ✅)

**Redux Selectors - All typed with RootState:**
- `features/filterSlice.ts` - 6 selectors + FilterState interface, typed employee as 'any' | Employee | undefined
- `features/appointments/appointmentSlice.ts` - 2 selectors (selectRescheduling, selectModifyingApptId)
- `features/appointments/apptApiSlice.ts` - Entity adapter selectors
- `features/userSlice.ts` - Entity adapter selectors
- `features/scheduleSlice.ts` - Entity adapter selectors
- `features/employeeSlice.ts` - Entity adapter selectors
- Removed unused `chooseEmployeePref` export from filterSlice

**Hooks Updated:**
- `hooks/useEmployeesQuery.ts` - RootState typed
- `hooks/useScheduleQuery.ts` - RootState typed
- `hooks/useUsersQuery.ts` - RootState typed
- `hooks/useFilter.ts` - Returns 'any' | Employee | undefined for employee

**Type Guards Added:**
- `components/ApptCard/ApptButton/CancelAppointment.tsx` - Type guard for User | string
- `components/ApptCard/ApptButton/ModifyAppointment.tsx` - Type guard for User | string
- `components/ApptCard/PastCard/index.tsx` - Type guard for User | string
- `components/ApptCard/UpcomingCard/index.tsx` - Type guard for User | string
- `routes/DashboardAppointment/StatusColumn/index.tsx` - Type guard for employee User | string
- `routes/BookingPage/EmployeeEdit/index.tsx` - Type guard for 'any' | Employee

**Type Improvements:**
- `app/api/apiSlice.ts` - ErrorResponse interface replaces `any` assertions
- `types/index.ts` - Appointment.employee/client typed as `User | string`, added _id field to User
- `utils/date.ts` - ScheduleAppointment.employee typed as `User | string`, SelectedEmployee._id field
- `routes/BookingPage/index.tsx` - Slot type guard, proper Dayjs conversion, employee ID extraction
- `routes/BookingPage/EmployeeRadio.tsx` - RootState typed
- `routes/BookingPage/EmployeeSelect/index.tsx` - Type guard for employee access
- `routes/BookingPage/BookingForm/index.tsx` - Updated props to 'any' | Employee | undefined
- `routes/BookingPage/AvailableTimes/index.tsx` - Updated props to 'any' | Employee | undefined

### Current Status
- **Typecheck:** ✅ 0 errors
- **Build:** ✅ Succeeds
- **Any Count:** 0 in selectors (all replaced with RootState)
- **All `@ts-expect-error` directives:** ✅ Removed

### Architecture Notes
- Use `import.meta.env` for env vars
- All Redux selectors use `RootState` instead of `any`
- Type guards pattern: `typeof x === 'object'` for union types
- Employee type: 'any' | Employee | undefined throughout filter system
- User type includes both id and _id for API compatibility
- Centralized types in `client/src/types/index.ts`
