# Cut Above Barbershop

Web page for a barbershop. Users can sign up and book an appointment.

**Link to project:** https://cutaboveshop.fly.dev

![alt tag]()

## How It's Made:

**Frontend:** Javascript, React, Material UI, Redux Toolkit.

Material UI for components, styles, theming, and responsiveness. Redux Toolkit for state management and data fetching. Vite allows larger bundles to be separated so that load times are kept minimal.

**Backend:** Node.js, Express, MongoDB, Nodemailer

Nodemailer to send account and appointment information to users.

## Features

- Scheduling of appointments based on various needs like service, time, and employee availablity.

- Appointment modifying and cancelling for users.

- User authentication with JWT tokens. Refresh rotation of tokens to keep users authenticated.

- Admin dashboard for quickly modifying, checking in, or cancelling appointments.

- Email service for users which allow them to access appointment and account settings.

## How to Run:

1. Fork the repository

2. In the project root directory. Enter these commands:
   `cd client && npm install` to install client side dependencies, and then
   `cd ../server && npm run install` to install server side dependencies

3. Change `.env-example` to `.env` and fill in all the appropiate information.

4. Run `npm run build:ui`. This creates the build process for the client side code.

5. After the build process is done, you are ready to use. Just run `npm run start` while still inside the `server` directory, and navigate to `http://localhost:3000` in your browser.
