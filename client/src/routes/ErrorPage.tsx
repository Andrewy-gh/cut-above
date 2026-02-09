import { Link, useRouteError } from 'react-router';
import { getPublicErrorContent } from '@/utils/publicError';

export default function ErrorPage() {
  const error = useRouteError();
  const { heading, message, details } = getPublicErrorContent(error);

  return (
    <div className="container-lg">
      <h1>{heading}</h1>
      <p>{message}</p>
      {import.meta.env.DEV && details ? (
        <details>
          <summary>Details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
        </details>
      ) : null}
      <Link to="/">
        Click <u>here</u> to return home
      </Link>
    </div>
  );
}
