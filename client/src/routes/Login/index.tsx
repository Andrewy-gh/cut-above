import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useAuth } from '@/hooks/useAuth';

import { useNotification } from '@/hooks/useNotification';

import { useSendPasswordResetMutation } from '@/features/emailSlice';

import Overlay from '@/components/Overlay';

import PasswordInput from '@/components/PasswordInput';

import { emailIsValid } from '@/utils/email';

import styles from './styles.module.css';

interface LocationState {
  from?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { user, handleLogin } = useAuth();

  const { handleSuccess, handleError } = useNotification();
  const [sendPasswordReset] = useSendPasswordResetMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
    } catch (err) {
      handleError(err);
    }
  };
  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!emailIsValid(email)) {
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

  useEffect(() => {
    if (user) {
      const from = state?.from;
      navigate(from || '/account');
    }
  }, [user, navigate, state]);

  if (view === 'login') {
    content = (
      <>
        <h3 className="text-center">Log in</h3>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            required
            fullWidth
            value={email}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setEmail(target.value)
            }
          ></TextField>
          <PasswordInput
            error={error}
            value={password}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
              setPassword(target.value)
            }
            label="Password *"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Login
          </Button>
        </form>
        <div className={styles.font} onClick={() => setView('reset')}>
          Forgot password?
        </div>
      </>
    );
  } else {
    content = (
      <>
        <h3 className="text-center">Reset Password</h3>
        <form onSubmit={handleReset}>
          <TextField
            label="Email"
            required
            fullWidth
            value={email}
            error={error}
            helperText={helperText}
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setEmail(target.value);
              setError(false);
              setHelperText('');
            }}
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
        <div className={styles.font} onClick={() => setView('login')}>
          Login
        </div>
      </>
    );
  }

  return (
    <Overlay>
      <div className="container-sm">{content}</div>
    </Overlay>
  );
}
