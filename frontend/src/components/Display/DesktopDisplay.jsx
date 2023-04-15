import Box from '@mui/material/Box';

const DesktopDisplay = ({ children }) => {
  return <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{children}</Box>;
};

export default DesktopDisplay;
