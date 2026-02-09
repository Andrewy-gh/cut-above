import { Link, useRouteError } from 'react-router';
import { getPublicErrorContent } from '@/utils/publicError';

export default function Error() {
  const error = useRouteError();
  const { details } = getPublicErrorContent(error);
  return (
    <main className="container-lg">
      <h5>Oops looks like an error happened...</h5>
      {import.meta.env.DEV && details ? (
        <details>
          <summary>Details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
        </details>
      ) : null}
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
