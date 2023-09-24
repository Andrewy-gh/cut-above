import { theme } from '../styles/styles';
import logoSide from '../assets/cover-logo-side-small.webp';

const Copyright = () => {
  return (
    <p style={{ fontSize: '14px', fontWeight: '500' }}>
      {'Copyright © '}
      {new Date().getFullYear()}
      {'.'}
    </p>
  );
};

export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        padding: '.75rem .75rem',
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Copyright />
        <div style={{ width: 'clamp(150px, 40%, 250px)' }}>
          <img
            src={logoSide}
            alt="Cut Above Barbershop logo image side variation"
          />
        </div>
      </div>
    </footer>
  );
}
