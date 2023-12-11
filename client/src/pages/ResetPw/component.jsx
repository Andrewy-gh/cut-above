import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAccount } from '@/hooks/useAccount';

export default function Component({ token }) {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { handleUserPasswordReset } = useAccount();

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
    const passwordChanged = await handleUserPasswordReset({
      token,
      newPassword,
    });
    if (passwordChanged) {
      setNewPassword('');
      setConfirmNewPassword('');
    }
    navigate('/login');
  };

  return (
    <>
      <h3 className="text-center">Reset password</h3>
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
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, mb: 3 }}
        >
          Change Password
        </Button>
      </form>
    </>
  );
}
