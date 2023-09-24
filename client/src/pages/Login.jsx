import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../hooks/useAuth';
import Overlay from '../components/Overlay';
import { useNotification } from '../hooks/useNotification';

import { useSendPasswordResetMutation } from '../features/emailSlice';

export default function Login() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { handleLogin } = useAuth();

  const { handleSuccess, handleError } = useNotification();
  const [sendPasswordReset] = useSendPasswordResetMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      handleLogin(email, password);
    } catch (err) {
      handleError(err);
    }
  };
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(email)) {
        setError(true);
        setHelperText('invalid email');
        return;
      }
      const sentResetEmail = await sendPasswordReset({ email }).unwrap();
      if (sentResetEmail.success) handleSuccess(sentResetEmail.message);
    } catch (err) {
      handleError(err);
    }
  };
  let content;
  if (view === 'login') {
    content = (
      <>
        <h3 style={{ textAlign: 'center' }}>Log in</h3>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            required
            fullWidth
            value={email}
            onChange={({ target }) => setEmail(target.value)}
          ></TextField>
          <TextField
            error={error}
            label="Password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          ></TextField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Login
          </Button>
        </form>
        <div
          style={{ fontFamily: 'Corben', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => setView('reset')}
        >
          Forgot password?
        </div>
      </>
    );
  } else {
    content = (
      <>
        {' '}
        <h3 style={{ textAlign: 'center' }}>Reset Password</h3>
        <form onSubmit={handleReset}>
          <TextField
            label="Email"
            required
            fullWidth
            value={email}
            helperText={helperText}
            onChange={({ target }) => setEmail(target.value)}
          ></TextField>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Reset password
          </Button>
        </form>
        <div
          style={{ fontFamily: 'Corben', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => setView('login')}
        >
          Login
        </div>
      </>
    );
  }

  return (
    <Overlay>
      <div style={{ width: 'min(40ch, 100% - 2rem)', marginInline: 'auto' }}>
        {content}
      </div>
    </Overlay>
  );
}
