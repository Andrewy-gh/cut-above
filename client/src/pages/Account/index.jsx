import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from '@/components/account/LogoutButton';
import { useAuth } from '@/hooks/useAuth';
import styles from './styles.module.css';

export default function Account() {
  const navigate = useNavigate();
  const { email, role, token } = useAuth();
  const welcome = email ? `Welcome ${email} to the ` : 'Welcome to the ';

  if (!token) {
    navigate('/login');
  }

  const adminRoutes = (
    <>
      <div className="body1">
        <Link to="/schedule">View schedule</Link>
      </div>
      <div className="body1">
        <Link to="/add">Add a new schedule</Link>
      </div>
    </>
  );

  return (
    <>
      <div className="container-lg">
        <h5 className={styles.header}>{welcome} Account page</h5>
        <div className="body1">
          <Link to="/account/settings">Account settings</Link>
        </div>
        <div className="body1">
          <Link to="/appointments">View your appointments</Link>
        </div>
        {role === 'admin' && adminRoutes}
        <div>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
