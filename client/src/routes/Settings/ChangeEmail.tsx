import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '@/hooks/useAuth';
import { cleanEmail, emailIsValid } from '@/utils/email';

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { handleUserEmailChange } = useAuth();

  const handleNewEmailChange = (e) => {
    setError(false);
    setHelperText('');
    setNewEmail(e.target.value);
  };

  const handleConfirmNewEmailChange = (e) => {
    setError(false);
    setHelperText('');
    setConfirmNewEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailIsValid(newEmail)) {
      setError(true);
      setHelperText('Invalid email');
      return;
    }
    if (newEmail !== confirmNewEmail) {
      setError(true);
      setHelperText('Emails do not match');
      return;
    }
    setNewEmail((newEmail) => cleanEmail(newEmail));
    const emailChanged = await handleUserEmailChange({ email: newEmail });
    if (emailChanged) {
      setNewEmail('');
      setConfirmNewEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container-sm">
      <TextField
        label="New email"
        required
        fullWidth
        value={newEmail}
        onChange={handleNewEmailChange}
        sx={{ marginBlock: '.5rem' }}
      ></TextField>
      <TextField
        label="Confirm new email"
        error={error}
        helperText={helperText}
        required
        fullWidth
        value={confirmNewEmail}
        onChange={handleConfirmNewEmailChange}
        sx={{ marginBlock: '.5rem' }}
      ></TextField>
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, mb: 3 }}>
        Change email
      </Button>
    </form>
  );
}
