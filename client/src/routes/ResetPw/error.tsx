import { Link, useRouteError } from 'react-router-dom';

export default function Error() {
  const error = useRouteError();
  return (
    <main className="container-lg">
      <h5>Oops looks like an error happened...</h5>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <p>
        Click{' '}
        <Link to="/login">
          <u>here</u>{' '}
        </Link>
        to request a password reset again
      </p>
    </main>
  );
}
