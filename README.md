# Cut Above Barbershop

Web page for a barbershop. Users can sign up and book an appointment.

![alt tag](https://github.com/Andrewyithub/cut-above-barbershop/assets/17731837/35958cd0-07e1-44e3-a0b3-2be928c285a6)

## How It's Made:

**Frontend:** React, Vite, Material UI, Redux Toolkit, Convex client.

Material UI for components, styles, theming, and responsiveness. Redux Toolkit for state management and data fetching. Vite allows larger bundles to be separated so that load times are kept minimal.

**Backend:** Convex (database + functions) with Better Auth.

Cookie based session storage through Redis. Pub/Sub through redis to handle email services. Nodemailer to send account and appointment information to users.

## Features

- Scheduling of appointments based on service, time, and employee availability.
- Appointment modifying and cancelling for users.
- Auth via Better Auth + Convex.
- Admin dashboard for modifying, checking in, or cancelling appointments.
- Email outbox + retry flow for appointment notifications and contact messages.

## How to Run:

1. Fork the repository.

2. Install dependencies:
   `pnpm install`

3. Start Convex dev (terminal 1):
   - Cloud dev deployment (default):
     `pnpm dev:convex`
   - Local dev deployment (can reach local Mailpit at 127.0.0.1):
     `pnpm dev:convex:local`
   - All-in-one local dev (Convex local + Mailpit + client):
     `pnpm dev:local`

4. Set environment variables:
   - Client + seed script: copy `.env.example` to `.env.local` and set `CONVEX_DEPLOYMENT_URL` and `CONVEX_SITE_URL` from the Convex dev output.
     Client reads the repo-root `.env.local` (no `client/.env.local`).
   - Convex env (one time per deployment): set `SITE_URL` (client origin) for Better Auth:
     `pnpm dev:setup`

5. Seed the database (Convex dev server must be running):
   `pnpm seed`

6. Run the client (terminal 2):
   `pnpm -C client dev`

7. Optional (email automation via Mailpit):
   - Copy `.env.mailpit.example` to `.env.mailpit.local`.
   - Set Convex runtime env to use Mailpit SMTP:
     `pnpm dev:setup:mailpit`
   - Run `pnpm email:test`.

## Switching Convex dev (local vs cloud)

- Store your cloud dev URLs once in `.env.local`:
  - `CONVEX_DEPLOYMENT_URL_CLOUD=...`
  - `CONVEX_SITE_URL_CLOUD=...` (falls back to deployment url if omitted)
- Switch client config:
  - Use local: `pnpm convex:use:local` (defaults to `http://localhost:3210`)
  - Use cloud: `pnpm convex:use:cloud`
- Start Convex dev in the same mode:
  - Local: `pnpm dev:convex:local`
  - Cloud: `pnpm dev:convex:cloud`

## Docs

- `docs/convex-workflow.md` for Convex dev/deploy setup.
- `scripts/README.md` for local vs cloud switching details (and what the dev/seed scripts do).
