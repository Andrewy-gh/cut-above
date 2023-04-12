import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const ConfirmDialog = ({
  disabled = false,
  dialog,
  agreeHandler,
  closeHandler,
  openDialog = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    closeHandler();
  };

  const handleAgree = () => {
    setOpen(false);
    agreeHandler();
  };

  return (
    <Box>
      <Button
        variant="contained"
        disabled={disabled}
        onClick={handleClick}
        fullWidth
      >
        {dialog.button}
      </Button>
      <Dialog open={open} fullScreen={fullScreen}>
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAgree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfirmDialog;
