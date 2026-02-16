# Seed + Reset Runbook

Use this to generate realistic demo data and refresh safely.

## Modes

- `seed:dev`: shared password, default user set, realistic appointments.
- `seed:prod`: per-user passwords from `.seed-prod.json`.
- `seed:reset`: reset seeded records (dev mode users).
- `seed:reset:prod`: reset seeded records using prod user list.

## Files

- Template tracked: `.seed-prod.example.json`
- Secret local file: `.seed-prod.json` (gitignored)

## Defaults

- Start offset: 14 days from runtime date.
- Span: 120 days.
- Weekdays only.
- Daily density per employee: 2-4 appointments.
- Seeded ID prefix: `seed-`.

## Optional env knobs

- `SEED_START_OFFSET_DAYS`
- `SEED_TOTAL_DAYS`
- `SEED_MIN_APPOINTMENTS_PER_EMPLOYEE_DAY`
- `SEED_MAX_APPOINTMENTS_PER_EMPLOYEE_DAY`
- `SEED_ID_PREFIX`
- `SEED_USERS_FILE` (for prod mode)
- `SEED_PASSWORD` (dev mode shared password)

## Safety guards

- Cloud seed/reset requires `ALLOW_CLOUD_SEED=true`.
- Reset requires `CONFIRM_SEED_RESET=true`.
- Reset only deletes seeded IDs and listed seeded users.

## Common commands

```powershell
# local dev seed
pnpm seed:dev

# local dev reset + reseed
$env:CONFIRM_SEED_RESET="true"
pnpm seed:reset
pnpm seed:dev

# prod-like seed
$env:ALLOW_CLOUD_SEED="true"
pnpm seed:prod

# prod-like reset (break-glass)
$env:ALLOW_CLOUD_SEED="true"
$env:CONFIRM_SEED_RESET="true"
pnpm seed:reset:prod
```
