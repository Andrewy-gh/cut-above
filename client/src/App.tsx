import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import Layout from '@/routes/Layout';

import Home from '@/routes/Home';

import BookingPage from '@/routes/BookingPage';
import LegacyRescheduleRedirect from '@/routes/BookingPage/LegacyRescheduleRedirect';

import Login from '@/routes/Login';

import Register from '@/routes/Register';
import LoadingSpinner from './components/LoadingSpinner';

import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if (import.meta.env?.PROD) disableReactDevTools();

// Lazy-loaded components
const Account = lazy(() => import('./routes/Account'));
const Cancellation = lazy(() => import('./routes/Cancellation'));
const RequireAuth = lazy(() => import('./routes/RequireAuth'));
const AppointmentPage = lazy(() => import('./routes/AppointmentPage'));
const AppointmentError = lazy(() => import('./routes/AppointmentPage/error'));
const Appointments = lazy(() => import('./routes/Appointments'));
const AddSchedule = lazy(() => import('./routes/AddSchedule'));
const DashboardSchedule = lazy(() => import('./routes/DashboardSchedule'));
const DashboardAppointment = lazy(
  () => import('./routes/DashboardAppointment')
);
const Settings = lazy(() => import('./routes/Settings'));
const Unauthorized = lazy(() => import('./routes/RequireAuth/Unauthorized'));
const ErrorPage = lazy(() => import('./routes/ErrorPage'));
const ResetPw = lazy(() => import('./routes/ResetPw'));
const ResetPwError = lazy(() => import('./routes/ResetPw/error'));

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      hydrateFallbackElement: <LoadingSpinner />,
      errorElement: (
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorPage />
        </Suspense>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: 'signup', element: <Register /> },
        { path: 'login', element: <Login /> },
        { path: 'bookings', element: <BookingPage /> },
        { path: 'bookings/:id', element: <LegacyRescheduleRedirect /> },
        {
          element: <RequireAuth />,
          children: [
            {
              path: 'appointment/:id',
              element: <AppointmentPage />,
              errorElement: (
                <Suspense fallback={<LoadingSpinner />}>
                  <AppointmentError />
                </Suspense>
              ),
            },
            {
              path: 'account',
              errorElement: (
                <Suspense fallback={<LoadingSpinner />}>
                  <Unauthorized />
                </Suspense>
              ),
              children: [
                { index: true, element: <Account /> },
                { path: 'settings', element: <Settings /> },
                { path: 'appointments', element: <Appointments /> },
                {
                  path: 'appointments/:id',
                  element: <AppointmentPage />,
                  errorElement: (
                    <Suspense fallback={<LoadingSpinner />}>
                      <AppointmentError />
                    </Suspense>
                  ),
                },
                {
                  path: 'appointments/:id/reschedule',
                  element: <BookingPage />,
                  errorElement: (
                    <Suspense fallback={<LoadingSpinner />}>
                      <AppointmentError />
                    </Suspense>
                  ),
                },
              ],
            },
          ],
        },
        {
          element: <RequireAuth requiredRole="admin" />,
          errorElement: (
            <Suspense fallback={<LoadingSpinner />}>
              <Unauthorized />
            </Suspense>
          ),
          children: [
            { path: 'addschedule', element: <AddSchedule /> },
            {
              path: 'dashboard',
              element: <DashboardSchedule />,
            },
            {
              path: 'dashboard/:id',
              element: <DashboardAppointment />,
            },
          ],
        },
        {
          path: 'resetpw',
          element: <ResetPw />,
          errorElement: (
            <Suspense fallback={<LoadingSpinner />}>
              <ResetPwError />
            </Suspense>
          ),
        },
        {
          path: 'cancellation',
          element: <Cancellation />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default function App() {
  return <RouterProvider router={router} />;
}
