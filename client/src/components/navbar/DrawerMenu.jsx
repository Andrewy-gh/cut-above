import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../hooks/useAuth';
import { navigation } from '../../data/data';
import { renderLink } from '../../utils/navigation';
import { theme } from '../../styles/styles';
import logoTop from '../../assets/cover-logo-top-small.webp';

const listItemStyle = {
  fontFamily: 'Corben',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.secondary.main,
  marginBottom: '1rem',
};

export default function DrawerMenu() {
  const { role, token, handleLogout } = useAuth();
  const [open, setOpen] = useState(false);

  const getList = () => (
    <div
      onClick={() => setOpen(false)}
      style={{
        height: '100vh',
        height: '100dvh',
        width: '100vw',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '10%',
            marginBottom: '2rem',
          }}
        >
          {navigation.map((link) =>
            renderLink(link, token, role) ? (
              <li key={link.id} style={listItemStyle}>
                <Link to={link.path}>{link.name}</Link>
              </li>
            ) : null
          )}
          {token && (
            <li
              onClick={handleLogout}
              style={{ ...listItemStyle, cursor: 'pointer' }}
            >
              Logout
            </li>
          )}
        </ul>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: 'clamp(200px, 60%, 300px)',
          marginInline: 'auto',
        }}
      >
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
        <MenuIcon style={{ fontSize: '2rem' }} />
      </IconButton>
      <Drawer open={open} anchor={'left'} onClose={() => setOpen(false)}>
        {getList()}
      </Drawer>
    </>
  );
}
