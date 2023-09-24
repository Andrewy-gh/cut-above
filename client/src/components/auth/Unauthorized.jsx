import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div>
      <div>
        Oops looks like you took a wrong turn. Click here to return{' '}
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}
