import { theme } from '@/styles/styles';
import logoSide from '@/assets/cover-logo-side-small.webp';
import styles from './styles.module.css';

const Copyright = () => {
  return (
    <p className={styles.font}>
      {'Copyright © '}
      {new Date().getFullYear()}
      {'.'}
    </p>
  );
};

export default function Footer() {
  return (
    <footer
      className={styles.spacing}
      style={{
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <div className={styles.flex}>
        <Copyright />
        <div className={styles.spacing_scale}>
          <img
            src={logoSide}
            alt="Cut Above Barbershop logo image - side variation"
          />
        </div>
      </div>
    </footer>
  );
}
