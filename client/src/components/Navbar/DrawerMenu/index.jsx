import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/hooks/useAuth';
import { navigation } from '@/data/data';
import { renderLink } from '@/utils/navigation';
import { theme } from '@/styles/styles';
import logoTop from '@/assets/cover-logo-top-small.webp';
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
          {navigation.map((link) =>
            renderLink(link, user, role) ? (
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
