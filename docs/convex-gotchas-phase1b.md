# Convex Gotchas — Phase 1b

- `npx convex dev --once --configure=new` fails in this non-interactive environment with: "Cannot prompt for input in non-interactive terminals. (Welcome to Convex! Would you like to login to your account?)".
- `pnpm test` fails in server suites without `DATABASE_URL` from `.env.test` (TypeError "The \"url\" argument must be of type string. Received undefined" in `server/src/utils/db.ts`).
