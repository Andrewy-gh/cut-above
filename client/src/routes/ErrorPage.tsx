import { useRouteError } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="container-lg">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/">
        Click <u>here</u> to return home
      </Link>
    </div>
  );
}
