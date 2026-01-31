# Cut Above Barbershop

Web page for a barbershop. Users can sign up and book an appointment.

**Link to project:** https://cutabove.fly.dev

![alt tag](https://github.com/Andrewyithub/cut-above-barbershop/assets/17731837/35958cd0-07e1-44e3-a0b3-2be928c285a6)

## How It's Made:

**Frontend:** Javascript, React, Material UI, Redux Toolkit.

Material UI for components, styles, theming, and responsiveness. Redux Toolkit for state management and data fetching. Vite allows larger bundles to be separated so that load times are kept minimal.

**Backend:** Node.js, Express, Postgres, Redis, Nodemailer

Cookie based session storage through Redis. Pub/Sub through redis to handle email services. Nodemailer to send account and appointment information to users.

## Features

- Scheduling of appointments based on various needs like service, time, and employee availablity.

- Appointment modifying and cancelling for users.

- User authentication with Redis session storage.

- Admin dashboard for quickly modifying, checking in, or cancelling appointments.

- Email service for users which allow them to access appointment and account settings.

## How to Run:

1. Fork the repository

2. In the project root directory. Enter these commands:
   `cd client && pnpm install` to install client side dependencies, and then
   `cd ../server && pnpm install` to install server side dependencies

3. Copy `server/.env.example` to `server/.env` and fill in values (including `PROD_CLIENT_URL` for dashboard links and `CORS_ALLOWED_ORIGINS` when the UI is on a different domain).
4. Copy `client/.env.example` to `client/.env` and set `VITE_API_URL` to your API (for example `https://cutaboveshop.fly.dev`).

5. If you want to seed a local database, copy the example seed data: from `server/src/utils`, run `cp data.example.ts data.ts`.

6. Run `pnpm run build:ui`. This creates the build process for the client side code.

7. After the build process is done, you are ready to use. Just run `pnpm run start` while still inside the `server` directory, and navigate to `http://localhost:3000` in your browser.
