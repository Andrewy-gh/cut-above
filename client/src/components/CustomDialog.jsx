import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../styles/styles';
import PropTypes from 'prop-types';

export default function CustomDialog({ children, open, handleClose }) {
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      maxWidth="lg"
    >
      {children}
    </Dialog>
  );
}

CustomDialog.propTypes = {
  children: PropTypes.object,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func,
};
