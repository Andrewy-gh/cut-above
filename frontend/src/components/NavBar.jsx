import { Link } from 'react-router-dom';
import LogoutButton from '../features/auth/LogoutButton';

const NavBar = () => {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Link to="/">Home</Link>
      <Link to="/schedule">Schedule</Link>
      <Link to="/add">Add Schedule</Link>
      <Link to="/login">Login</Link>
      <Link to="/welcome">Welcome</Link>
      <Link to="/appointments">Appointments</Link>
      <LogoutButton />
    </div>
  );
};

export default NavBar;
