# Route to Convex Mapping (Phase 0b)

## API routes inventory -> Convex mapping

| Route                           | Method | Convex type | Key data models                          | Notes                                                                        |
| ------------------------------- | ------ | ----------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| /api/users                      | GET    | Query       | User                                     | Admin-only list in server middleware.                                        |
| /api/appointments               | GET    | Query       | Appointment, User                        | Role-based (client/employee).                                                |
| /api/appointments               | POST   | Mutation    | Appointment, Schedule, User, EmailOutbox | Books appointment; enqueues confirmation email.                              |
| /api/appointments/:id           | GET    | Query       | Appointment, User                        | Access control per role + ownership.                                         |
| /api/appointments/:id           | PUT    | Mutation    | Appointment, User, EmailOutbox           | Reschedule/modify; enqueues modification email.                              |
| /api/appointments/:id           | DELETE | Mutation    | Appointment, User, EmailOutbox           | Cancel; enqueues cancellation email.                                         |
| /api/appointments/status/:id    | PUT    | Mutation    | Appointment                              | Admin-only status update.                                                    |
| /api/schedules                  | GET    | Query       | Schedule, Appointment, User              | Public view (employee info).                                                 |
| /api/schedules/dashboard        | GET    | Query       | Schedule, Appointment, User              | Private view (client + employee info).                                       |
| /api/schedules                  | POST   | Mutation    | Schedule                                 | Create date range schedules.                                                 |
| /api/auth/login                 | POST   | Mutation    | User, session                            | Sets session + role flags.                                                   |
| /api/auth/logout                | GET    | Query       | session                                  | Side effect: destroys session + clears cookie. Should be mutation in Convex. |
| /api/auth/signup                | POST   | Mutation    | User                                     | Creates user.                                                                |
| /api/auth/email                 | PUT    | Mutation    | User                                     | Change email.                                                                |
| /api/auth/password              | PUT    | Mutation    | User                                     | Change password.                                                             |
| /api/auth/validation/:id/:token | GET    | Query       | PasswordResetToken                       | Validates reset token, increments usage.                                     |
| /api/auth/reset-pw/:id/:token   | PUT    | Mutation    | User, PasswordResetToken, EmailOutbox    | Resets password; enqueues confirmation email.                                |
| /api/employees                  | GET    | Query       | User                                     | Users with role=employee (limited fields).                                   |
| /api/employees/profiles         | GET    | Query       | User                                     | Employees with profiles (more fields).                                       |
| /api/email/new-message          | POST   | Mutation    | EmailOutbox                              | Enqueues auto-reply + internal notification.                                 |
| /api/email/reset-pw             | POST   | Mutation    | User, PasswordResetToken, EmailOutbox    | Generates reset link + enqueue reset email.                                  |
| /api/docs/openapi.json          | GET    | Query       | none                                     | Static OpenAPI spec.                                                         |
| /api/docs                       | GET    | Query       | none                                     | Swagger UI.                                                                  |

## UI flows inventory (pages -> API usage)

- Home (`/`): team members -> `GET /api/employees/profiles`; contact form -> `POST /api/email/new-message`.
- Booking (`/bookings/:id?`): employees -> `GET /api/employees`; schedule -> `GET /api/schedules`; book -> `POST /api/appointments`; reschedule -> `PUT /api/appointments/:id`.
- Appointment detail (`/appointment/:id`): load -> `GET /api/appointments/:id`; cancel -> `DELETE /api/appointments/:id`.
- Account (`/account`): logout -> `GET /api/auth/logout`.
- Account settings (`/account/settings`): email change -> `PUT /api/auth/email`; password change -> `PUT /api/auth/password`.
- Account appointments (`/account/appointments`): list -> `GET /api/appointments`.
- Admin add schedule (`/addschedule`): create -> `POST /api/schedules`.
- Admin dashboard (`/dashboard`): schedules -> `GET /api/schedules` (public view).
- Admin schedule detail (`/dashboard/:id`): schedule + appointments -> `GET /api/schedules` then filter client-side.
- Auth register (`/signup`): `POST /api/auth/signup`.
- Auth login (`/login`): `POST /api/auth/login`; password reset request -> `POST /api/email/reset-pw`.
- Reset password flow (`/resetpw/:id/:token`): validate -> `GET /api/auth/validation/:id/:token`; reset -> `PUT /api/auth/reset-pw/:id/:token`.

## Test coverage notes (current)

Server:

- Appointment API integration: `server/src/controllers/appointmentController.test.ts` (booking, conflicts, role access, modify/cancel/status).
- Appointment API E2E: `server/src/controllers/appointmentController.e2e.test.ts`.
- Auth + appointment services: `server/src/services/authService.test.ts`, `server/src/services/appointmentService.test.ts`.
- Email outbox + email: `server/src/services/emailOutboxService.test.ts`, `server/src/services/emailService.test.ts`.
- Schemas: `server/src/schemas/appointmentSchema.test.ts`, `server/src/schemas/authSchema.test.ts`.
- Utils: `server/src/utils/errorDetails.test.ts`, `server/src/utils/formatters.test.ts`, `server/src/utils/dateTime.test.ts`, `server/src/utils/emailOptions.test.ts`, `server/src/utils/rowLevelSecurity.test.ts`.

Client:

- Route-level smoke tests: `client/src/routes/routes.test.tsx` (component render + hooks mocked).
- Component: `client/src/components/ErrorBoundary.test.tsx`.
- Utils: `client/src/utils/apiError.test.ts`, `client/src/utils/date.test.ts`.

## Critical flows (minimal edge-case tests to preserve)

- Booking/rescheduling: schedule conflict detection, employee ownership checks, UTC timestamp validation.
- Appointment cancellation: access control + email enqueue.
- Admin status updates: role enforcement + status transitions.
- Schedule creation: date range + time normalization.
- Auth session: login/logout cookie + role propagation in server dbContext.
- Password reset: token validation expiry/usage + reset flow.
- Email outbox: dedupe keys + retry behavior.
