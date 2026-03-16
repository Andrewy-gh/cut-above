import { Link, useRouteError } from 'react-router';
import { getPublicErrorContent } from '@/utils/publicError';

export default function ManageAppointmentError() {
  const error = useRouteError();
  const { heading, message, details } = getPublicErrorContent(error);
  const showDetails =
    import.meta.env.DEV && import.meta.env.VITE_SHOW_ERROR_DETAILS === 'true';

  return (
    <main className="container-lg">
      <h1>{heading}</h1>
      <p>{message}</p>
      {showDetails && details ? (
        <details>
          <summary>Details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
        </details>
      ) : null}
      <p>
        <Link to="/bookings">
          Book <u>a new appointment</u>
        </Link>
      </p>
      <p>
        <Link to="/login">
          Log into <u>your account</u>
        </Link>
      </p>
      <p>
        <Link to="/">
          Return <u>home</u>
        </Link>
      </p>
    </main>
  );
}
