import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import DrawerMenu from '../DrawerMenu';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function NavMobile() {
  return (
    <div className={styles.flex}>
      <DrawerMenu />
      <Link to="/">
        <Typography variant="h4" component="div">
          Cut Above
        </Typography>
      </Link>
    </div>
  );
}
