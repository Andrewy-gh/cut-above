import { Link, useRouteError } from 'react-router';
import { RouteError } from '@/types';

export default function Error() {
  const error = useRouteError();
  return (
    <main className="container-lg">
      <h5>Oops looks like an error happened...</h5>
      <p>
        <i>
          {(error as RouteError).statusText || (error as RouteError).message}
        </i>
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
