# Convex Gotchas — Phase 1a

- `npx convex init` is deprecated; CLI requests `npx convex dev --once --configure=new` instead.
- Convex CLI requires interactive login in this environment, so `npx convex dev` and `npx convex dev --once --configure=new` fail with: "Cannot prompt for input in non-interactive terminals. (Welcome to Convex! Would you like to login to your account?)".
