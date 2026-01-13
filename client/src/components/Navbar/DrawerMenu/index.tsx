import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

// @ts-expect-error TS(2307): Cannot find module '@/data/data' or its correspond... Remove this comment to see the full error message
import { navigation } from '@/data/data';

// @ts-expect-error TS(2307): Cannot find module '@/utils/navigation' or its cor... Remove this comment to see the full error message
import { renderLink } from '@/utils/navigation';

// @ts-expect-error TS(2307): Cannot find module '@/styles/styles' or its corres... Remove this comment to see the full error message
import { theme } from '@/styles/styles';

// @ts-expect-error TS(2307): Cannot find module '@/assets/cover-logo-top-small.... Remove this comment to see the full error message
import logoTop from '@/assets/cover-logo-top-small.webp';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function DrawerMenu() {
  const { role, user, handleLogout } = useAuth();
  const [open, setOpen] = useState(false);

  const getList = () => (
    <div
      onClick={() => setOpen(false)}
      className={styles.container}
      style={{
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <div>
        <div>
          <IconButton
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 1,
              mb: 8,
              paddingInline: 2,
            }}
            onClick={() => setOpen(false)}
          >
            <CloseIcon
              sx={{ color: theme.palette.secondary.main, fontSize: '2rem' }}
            />
          </IconButton>
        </div>
        {/* Links conditionally rendered on login status */}
        <ul className={styles.list}>
          {navigation.map((link: any) => renderLink(link, user, role) ? (
            <li
              key={link.id}
              className={styles.list_item}
              style={{ color: theme.palette.secondary.main }}
            >
              <Link to={link.path}>{link.name}</Link>
            </li>
          ) : null
          )}
          {/* Logout Button */}
          {user && (
            <li
              onClick={handleLogout}
              className={`${styles.list_item} ${styles.cursor_pointer}`}
              style={{ color: theme.palette.secondary.main }}
            >
              Logout
            </li>
          )}
        </ul>
      </div>
      <div className={styles.image_container}>
        <img src={logoTop} alt="Cut Above Barbershop logo image" />
      </div>
    </div>
  );
  return (
    <>
      <IconButton
        edge="start"
        onClick={() => setOpen(true)}
        sx={{
          mr: 2,
          display: { sm: 'none' },
          color: theme.palette.secondary.dark,
        }}
      >
        <MenuIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
      <Drawer open={open} anchor={'left'} onClose={() => setOpen(false)}>
        {getList()}
      </Drawer>
    </>
  );
}
