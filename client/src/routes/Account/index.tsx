import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useAuth } from '@/hooks/useAuth';
import styles from './styles.module.css';

export default function Account() {
  const { user, role } = useAuth();
  const welcome = user ? `Welcome ${user} to the ` : 'Welcome to the ';

  const adminRoutes = (
    <>
      <div className="body1">
        <Link to="../dashboard">Schedule Dashboard</Link>
      </div>
      <div className="body1">
        <Link to="../addschedule">Add a new schedule</Link>
      </div>
    </>
  );

  return (
    <main className="container-lg">
      <h5 className={styles.header}>{welcome} Account page</h5>
      <div className="body1">
        <Link to="settings">Account settings</Link>
      </div>
      <div className="body1">
        <Link to="appointments">View your appointments</Link>
      </div>
      {role === 'admin' && adminRoutes}
      <div className="mt-4">
        <LogoutButton />
      </div>
    </main>
  );
}
