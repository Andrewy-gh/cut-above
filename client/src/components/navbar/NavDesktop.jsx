import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import { theme } from '../../styles/styles';
import { selectCurrentToken } from '../../features/auth/authSlice';

export default function NavDesktop() {
  const token = useSelector(selectCurrentToken);

  return (
    <ul
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      }}
    >
      <li style={{ placeSelf: 'center start' }}>
        <Link to="/bookings">
          <Button variant="contained">Book now</Button>
        </Link>
      </li>
      <li
        style={{
          placeSelf: 'center center',
          fontFamily: 'Corben',
          fontSize: '1.3125rem',
          fontWeight: 700,
          color: theme.palette.secondary.main,
        }}
      >
        <Link to="/">Cut Above</Link>
      </li>
      {token ? (
        <li style={{ placeSelf: 'center end' }}>
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
        <li style={{ placeSelf: 'center end' }}>
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
