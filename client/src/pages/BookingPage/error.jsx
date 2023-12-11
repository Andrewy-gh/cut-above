import { Link } from 'react-router-dom';
import styles from './styles.module.css';

// This is the error component when accessing through email
export default function Error() {
  return (
    <div className={styles.container}>
      <h5 className="text-center">Oops looks like an error happened...</h5>
      <Link to="/login">
        <p className="text-center">
          Please <u>login</u> to modify your appointment.
        </p>
      </Link>
    </div>
  );
}
