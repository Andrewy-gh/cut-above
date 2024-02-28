import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { theme } from '@/styles/styles';
import styles from './styles.module.css';

export default function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.text_container}>
        <h1 className="text-center">Experience a Cut Above The Rest</h1>
        <p
          className={`body1 ${styles.text_shadow}`}
          style={{
            color: theme.palette.secondary.main,
          }}
        >
          Book your appointment today and let us help you achieve the perfect
          haircut!
        </p>
        <div className="text-center">
          <Link to="/bookings">
            <Button variant="contained">Schedule an appointment</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
