import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { theme } from '../styles/styles';
import logoSide from '../assets/cover-logo-side.png';

const Copyright = () => {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 4,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Copyright />
        <CardMedia
          component="img"
          sx={{
            width: 'clamp(100px, 40%, 200px)',
          }}
          image={logoSide}
          alt="logo"
        />
      </Box>
    </Box>
  );
};

export default Footer;
