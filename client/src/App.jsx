import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/routes/Layout';
import Home from '@/routes/Home';
import BookingPage from '@/routes/BookingPage';
import Login from '@/routes/Login';
import Register from '@/routes/Register';
import TokenValidation from './routes/TokenVaidation';
import LoadingSpinner from './components/LoadingSpinner';

import { disableReactDevTools } from '@fvilers/disable-react-devtools';
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') disableReactDevTools();

// Lazy-loaded components
const Account = lazy(() => import('./routes/Account'));
const Cancellation = lazy(() => import('./routes/Cancellation'));
const RequireAuth = lazy(() => import('./routes/RequireAuth'));
const AppointmentPage = lazy(() => import('./routes/AppointmentPage'));
const AppointmentError = lazy(() => import('./routes/AppointmentPage/error'));
const Appointments = lazy(() => import('./routes/appointments'));
const AddSchedule = lazy(() => import('./routes/AddSchedule'));
const DashboardSchedule = lazy(() => import('./routes/DashboardSchedule'));
const DashboardAppointment = lazy(() =>
  import('./routes/DashboardAppointment')
);
const Settings = lazy(() => import('./routes/Settings'));
const Unauthorized = lazy(() => import('./routes/RequireAuth/Unauthorized'));
const ErrorPage = lazy(() => import('./routes/ErrorPage'));
const ResetPw = lazy(() => import('./routes/ResetPw'));
const ResetPwError = lazy(() => import('./routes/ResetPw/error'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorPage />
      </Suspense>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'signup', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'bookings/:id?', element: <BookingPage /> },
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
        element: <TokenValidation />,
        errorElement: (
          <Suspense fallback={<LoadingSpinner />}>
            <ResetPwError />
          </Suspense>
        ),
        children: [
          {
            path: 'resetpw/:id?/:token?',
            element: <ResetPw />,
          },
        ],
      },
      {
        path: 'cancellation',
        element: <Cancellation />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
