import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import hero from '../../assets/images/hero.webp';
import { theme } from '../../styles/styles';

export default function Hero() {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), url(${hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        aspectRatio: '16 / 9',
        display: 'flex',
        alignItems: 'center',
        padding: '2rem 2rem 4rem',
      }}
    >
      <div
        style={{
          marginInline: 'auto',
          maxWidth: '600px',
        }}
      >
        <h1 style={{ textAlign: 'center' }}>Experience a Cut Above The Rest</h1>
        {/* <Typography
          variant="body2"
          align="center"
          sx={{ fontWeight: { xs: 400, sm: 500 } }}
          paragraph
        >
          If you&apos;re looking for a top-quality haircut service in a
          welcoming and relaxing environment, look no further than our
          barbershop. Book your appointment today and let us help you achieve
          the perfect haircut!
        </Typography> */}
        <p
          className="body1"
          style={{
            textAlign: 'center',
            fontWeight: '500',
            color: theme.palette.secondary.main,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          Book your appointment today and let us help you achieve the perfect
          haircut!
        </p>
        <div style={{ textAlign: 'center' }}>
          <Link to="/reserve">
            <Button variant="contained">Schedule an appointment</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
