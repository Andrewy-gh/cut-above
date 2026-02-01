import { useRouteError } from 'react-router';
import { Link } from 'react-router';
import { RouteError } from '@/types';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="container-lg">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {(error as RouteError).statusText || (error as RouteError).message}
        </i>
      </p>
      <Link to="/">
        Click <u>here</u> to return home
      </Link>
    </div>
  );
}
