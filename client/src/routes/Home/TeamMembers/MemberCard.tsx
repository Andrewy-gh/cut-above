import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function MemberCard({ employee, handleClick }) {
  return (
    <Grid item xs={12} sm={6} md={4} sx={{ marginInline: 'auto' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardMedia
          component="img"
          image={employee.image}
          alt={employee.firstName}
          sx={{
            aspectRatio: '9 / 16',
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <h4 className={styles.header}>{employee.firstName}</h4>
          <p className={`body1 ${styles.paragraph}`}>{employee.profile}</p>
        </CardContent>
        <CardActions sx={{ marginInline: 'auto', mb: 2 }}>
          <Link to="/bookings" onClick={() => handleClick(employee.id)}>
            <Button
              size="small"
              variant="contained"
            >{`Book with ${employee.firstName}`}</Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
}

MemberCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    profile: PropTypes.string.isRequired,
  }),
  handleClick: PropTypes.func.isRequired,
};
