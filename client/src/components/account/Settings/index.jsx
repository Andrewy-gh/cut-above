import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import styles from './styles.module.css';

export default function Settings() {
  return (
    <div className={`container-sm ${styles.flex}`}>
      <h2 className={styles.header}>Account settings</h2>
      <div>
        <h4 className="text-center">Update Email</h4>
        <ChangeEmail />
      </div>
      <div>
        <h4 className="text-center">Update Password</h4>
        <ChangePassword />
      </div>
      <div className={styles.mx_auto}>
        <h4 className="text-center">Delete Account</h4>
        <DeleteAccount />
      </div>
    </div>
  );
}
