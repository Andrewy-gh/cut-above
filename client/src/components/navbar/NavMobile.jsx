import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import DrawerMenu from './DrawerMenu';

export default function NavMobile() {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <DrawerMenu />
      <Link to="/">
        <Typography variant="h4" component="div">
          Cut Above
        </Typography>
      </Link>
    </div>
  );
}
