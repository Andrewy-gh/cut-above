import { Link } from 'react-router';
import Button from '@mui/material/Button';

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
    <div className={styles.card}>
      <div className={styles.card_body}>
        <div className={styles.card_content}>
          <h4 className="text-center">{service.name}</h4>
          <p className={`body1 ${styles.paragraph}`}>{service.description}</p>
        </div>
        <div className={styles.card_actions}>
          <Link to="/bookings" onClick={() => handleClick(service.id)}>
            <Button variant="contained">{`Schedule ${service.name}`}</Button>
          </Link>
        </div>
      </div>
      <div className={styles.card_media}>
        <img
          className={styles.card_image}
          src={service.image}
          alt={service.name}
        />
      </div>
    </div>
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
