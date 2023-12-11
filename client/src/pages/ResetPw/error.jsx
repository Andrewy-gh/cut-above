import { Link } from 'react-router-dom';

export default function Error() {
  return (
    <>
      <h5 className="text-center">Oops looks like an error happened...</h5>
      <Link to="/login">
        <p className="text-center">
          Click <u>here</u> to request a password reset again
        </p>
      </Link>
    </>
  );
}
