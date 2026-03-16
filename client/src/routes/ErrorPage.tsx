import { Link, useRouteError } from 'react-router';
import { getPublicErrorContent } from '@/utils/publicError';

export default function ErrorPage() {
  const error = useRouteError();
  const { heading, message, details } = getPublicErrorContent(error);
  const showDetails =
    import.meta.env.DEV && import.meta.env.VITE_SHOW_ERROR_DETAILS === 'true';

  return (
    <div className="container-lg">
      <h1>{heading}</h1>
      <p>{message}</p>
      {showDetails && details ? (
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
