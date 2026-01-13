
// @ts-expect-error TS(2307): Cannot find module '@/styles/styles' or its corres... Remove this comment to see the full error message
import { theme } from '@/styles/styles';

// @ts-expect-error TS(2307): Cannot find module '@/assets/cover-logo-side-small... Remove this comment to see the full error message
import logoSide from '@/assets/cover-logo-side-small.webp';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
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
