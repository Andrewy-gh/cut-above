import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { services } from '../../data';
import { Link } from 'react-router-dom';
import { setService } from '../../features/filter/filterSlice';
import { useDispatch } from 'react-redux';

const Services = () => {
  const dispatch = useDispatch();
  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography component="h3" variant="h4" align="center" gutterBottom>
        Our Services
      </Typography>
      {services.map((service) => (
        <Grid
          container
          key={service.id}
          // xs={12}
          // sm={6}
          // md={4}
          sx={{ marginInline: 'auto', mt: 4, mb: 4 }}
        >
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
              <CardContent sx={{ flexGrow: 1, padding: 4 }}>
                <Typography
                  gutterBottom
                  component="h4"
                  variant="h5"
                  align="center"
                >
                  {service.name}
                </Typography>
                <Typography variant="body2" align="center">
                  {service.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ marginInline: 'auto', mb: 2 }}>
                <Link
                  to="/reserve"
                  onClick={() => dispatch(setService(service.name))}
                >
                  <Button size="small" variant="contained">
                    {`Schedule ${service.name}`}
                  </Button>
                </Link>
              </CardActions>
            </Grid>
            <Grid item md={6} lg={5}>
              <CardMedia
                component="img"
                sx={{
                  aspectRatio: '16 / 9',
                }}
                image={service.image}
                alt={service.name}
              />
            </Grid>
          </Card>
        </Grid>
      ))}
    </Container>
  );
};

export default Services;
