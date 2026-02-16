import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="container-lg">
      <h1>Page not found.</h1>
      <p>That page does not exist or may have moved.</p>
      <Link to="/">
        Go back <u>home</u>
      </Link>
    </div>
  );
}
