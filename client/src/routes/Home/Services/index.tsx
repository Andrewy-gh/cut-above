import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';

import { services } from '@/data/data';
import { useFilter } from '@/hooks/useFilter';
import styles from './styles.module.css';

interface Service {
  id: number;
  name: string;
  duration: number;
  image: string;
  description: string;
}

interface ServiceCardProps {
  service: Service;
  handleClick: (id: number) => void;
}

const ServiceCard = ({ service, handleClick }: ServiceCardProps) => {
  return (
    <Grid container sx={{ marginInline: 'auto', mt: 4, mb: 4 }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column', md: 'row' },
        }}
      >
        <Grid
          item
          md={6}
          lg={7}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent sx={{ paddingInline: 4 }}>
            <h4 className="text-center">{service.name}</h4>
            <p className={`body1 ${styles.paragraph}`}>{service.description}</p>
          </CardContent>
          <CardActions sx={{ marginInline: 'auto', mb: 6 }}>
            <Link to="/bookings" onClick={() => handleClick(service.id)}>
              <Button variant="contained">{`Schedule ${service.name}`}</Button>
            </Link>
          </CardActions>
        </Grid>
        <Grid item md={6} lg={5}>
          <CardMedia
            component="img"
            sx={{ height: '100%', width: '100%' }}
            image={service.image}
            alt={service.name}
          />
        </Grid>
      </Card>
    </Grid>
  );
};

export default function Services() {
  const { handleServiceChange } = useFilter();
  return (
    <div className={styles.container}>
      <h3 className={styles.header}>Our Services</h3>
      {services.map((service: Service) => (
        <ServiceCard
          key={service.id}
          service={service}
          handleClick={handleServiceChange}
        />
      ))}
    </div>
  );
}
