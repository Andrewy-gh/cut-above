import { Link, useRouteError } from 'react-router';
import { getPublicErrorContent } from '@/utils/publicError';

export default function Unauthorized() {
  const error = useRouteError();
  const { details } = getPublicErrorContent(error);
  return (
    <main className="container-lg">
      <h5>Oops Looks like you took a wrong turn.</h5>
      {import.meta.env.DEV && details ? (
        <details>
          <summary>Details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
        </details>
      ) : null}
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
