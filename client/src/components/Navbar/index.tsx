import { useMediaQuery } from '@mui/material/';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import NavDesktop from './NavDesktop';
import NavMobile from './NavMobile';

// @ts-expect-error TS(2307): Cannot find module '@/styles/styles' or its corres... Remove this comment to see the full error message
import { theme } from '@/styles/styles';

export default function Navbar() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <div>
      <AppBar
        component="nav"
        position="relative"
        sx={{ backgroundColor: theme.palette.primary.main }}
      >
        <Toolbar>{isMobile ? <NavMobile /> : <NavDesktop />}</Toolbar>
      </AppBar>
    </div>
  );
}
