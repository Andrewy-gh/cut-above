import Box from '@mui/material/Box';

const MobileDisplay = ({ children }) => {
  return <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{children}</Box>;
};

export default MobileDisplay;
