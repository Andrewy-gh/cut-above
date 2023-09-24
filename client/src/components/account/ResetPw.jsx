import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '../../hooks/useAccount';
import { useValidateTokenQuery } from '../../features/userSlice';

export default function ResetPw() {
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { handleUserPasswordReset } = useAccount();

  let token = searchParams.get('token');

  const {
    data: tokenStatus,
    isLoading,
    isSuccess,
    isError,
  } = useValidateTokenQuery({ option: 'reset', token });

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

  let content;
  if (isLoading) {
    return <p>Loading...</p>;
  } else if (isSuccess && tokenStatus.message === 'Token is valid') {
    content = (
      <>
        <h3 style={{ textAlign: 'center' }}>Reset password</h3>
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
  } else if (isError) {
    content = (
      <>
        <h5 style={{ textAlign: 'center' }}>
          Oops looks like an error happened...
        </h5>
        <Link to="/login">
          <p style={{ textAlign: 'center' }}>
            Click <u>here</u> to request a password reset again
          </p>
        </Link>
      </>
    );
  }
  return (
    <div style={{ width: 'min(40ch, 100% - 2rem)', marginInline: 'auto' }}>
      {content}
    </div>
  );
}
