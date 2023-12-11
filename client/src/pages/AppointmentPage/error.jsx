import { Link } from 'react-router-dom';

export default function Error() {
  return (
    <>
      <h5 className="text-center">Oops looks like an error happened...</h5>
      <Link to="/login">
        <p className="text-center">
          Please <u>login</u> to access your appointment information.
        </p>
      </Link>
    </>
  );
}
