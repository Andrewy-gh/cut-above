import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Link to="/schedule">Schedule</Link>
      <Link to="/booking">Booking</Link>
      <Link to="/add">Add Schedule</Link>
      <Link to="/login">Login</Link>
      <Link to="/employee">Employees</Link>
      <Link to="/welcome">Welcome</Link>
    </div>
  );
};

export default NavBar;
