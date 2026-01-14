import { Link, useRouteError } from 'react-router-dom';
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
        Please{' '}
        <Link to="/login">
          <u>login</u>{' '}
        </Link>
        to access your appointment information.
      </p>
    </main>
  );
}
