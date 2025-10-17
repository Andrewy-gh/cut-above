import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';

export default function NavDesktop() {
  const { user } = useAuth();

  return (
    <ul className={styles.grid_col_3}>
      <li style={{ placeSelf: 'center start' }}>
        <Link to="/bookings">
          <Button variant="contained">Book now</Button>
        </Link>
      </li>
      <li
        className={styles.list_item}
        style={{ color: theme.palette.secondary.main }}
      >
        <Link to="/">Cut Above</Link>
      </li>
      {user ? (
        <li className={styles.place_self}>
          <Link to="/account">
            <IconButton
              edge="start"
              sx={{ mr: 1, color: theme.palette.secondary.dark }}
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Link>
        </li>
      ) : (
        <li className={styles.place_self}>
          <Link to="/signup">
            <Button sx={{ color: theme.palette.secondary.dark }}>Signup</Button>
          </Link>
          <Link to="/login">
            <Button variant="contained">Login</Button>
          </Link>
        </li>
      )}
    </ul>
  );
}
