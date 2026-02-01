import { Link, useRouteError } from 'react-router';
import { RouteError } from '@/types';

export default function Unauthorized() {
  const error = useRouteError();
  return (
    <main className="container-lg">
      <h5>Oops Looks like you took a wrong turn.</h5>
      <p>
        <i>
          {(error as RouteError).statusText || (error as RouteError).message}
        </i>
      </p>
      <p>
        Click{' '}
        <Link to="/">
          <u>here</u>{' '}
        </Link>
        to return Home
      </p>
    </main>
  );
}
