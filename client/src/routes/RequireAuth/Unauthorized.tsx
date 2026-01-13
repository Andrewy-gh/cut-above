import { Link, useRouteError } from 'react-router-dom';

export default function Unauthorized() {
  const error = useRouteError();
  return (
    <main className="container-lg">
      <h5>Oops Looks like you took a wrong turn.</h5>
      <p>
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        <i>{error.statusText || error.message}</i>
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
