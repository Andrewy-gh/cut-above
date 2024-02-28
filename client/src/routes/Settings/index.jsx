import { Link } from 'react-router-dom';
import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
// import DeleteAccount from './DeleteAccount';
import styles from './styles.module.css';

export default function Settings() {
  return (
    <div className={`container-lg ${styles.flex}`}>
      <div className="mt-4">
        <Link to="/account">Back to account page</Link>
      </div>
      <h2 className={styles.header}>Account settings</h2>
      <div>
        <h4 className="text-center">Update Email</h4>
        <ChangeEmail />
      </div>
      <div>
        <h4 className="text-center">Update Password</h4>
        <ChangePassword />
      </div>
      {/* <div className={styles.mx_auto}>
        <h4 className="text-center">Delete Account</h4>
        <DeleteAccount />
      </div> */}
    </div>
  );
}
