import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAccount } from '../../hooks/useAccount';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { handleUserPasswordChange } = useAccount();

  const handleNewPasswordChange = (e) => {
    setError(false);
    setHelperText('');
    setNewPassword(e.target.value);
  };

  const handleConfirmNewPasswordChange = (e) => {
    setError(false);
    setHelperText('');
    setConfirmNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError(true);
      setHelperText('Passwords do not match');
      return;
    }
    const passwordChanged = await handleUserPasswordChange({
      password: newPassword,
    });
    if (passwordChanged) {
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="New Password"
        type="password"
        required
        fullWidth
        value={newPassword}
        onChange={handleNewPasswordChange}
        sx={{ marginBlock: '.5rem' }}
      ></TextField>
      <TextField
        label="Confirm new Password"
        type="password"
        error={error}
        helperText={helperText}
        required
        fullWidth
        value={confirmNewPassword}
        onChange={handleConfirmNewPasswordChange}
        sx={{ marginBlock: '.5rem' }}
      ></TextField>
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, mb: 3 }}>
        Change Password
      </Button>
    </form>
  );
}
