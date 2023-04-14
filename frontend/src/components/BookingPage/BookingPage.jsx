import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Search from './Search';
import chair from '../../assets/images/jay-huang-aZBQB-uYosc-unsplash.jpg';
import pole from '../../assets/images/tim-mossholder-q49oU8NeOHQ-unsplash.jpg';

const BookingPage = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography
        component="h3"
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mb: 5 }}
      >
        Schedule your appointment
      </Typography>
      <Grid container spacing={6}>
        <Grid item sm={12} sx={{ display: { sm: 'block', md: 'none' } }}>
          <Card>
            <CardMedia
              component="img"
              image={pole}
              alt="barbershop pole"
              sx={{
                aspectRatio: '16 / 9',
              }}
            ></CardMedia>
          </Card>
        </Grid>
        <Grid item sm={12} md={6}>
          <Search />
        </Grid>
        <Grid
          item
          md={6}
          sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}
        >
          <Card>
            <CardMedia
              component="img"
              image={chair}
              alt="chair in an barbershop"
              sx={{
                aspectRatio: '9 / 16',
              }}
            ></CardMedia>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingPage;
