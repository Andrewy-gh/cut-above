import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useNotification' or it... Remove this comment to see the full error message
import { useNotification } from '@/hooks/useNotification';

// @ts-expect-error TS(2307): Cannot find module '@/features/emailSlice' or its ... Remove this comment to see the full error message
import { useSendPasswordResetMutation } from '@/features/emailSlice';

// @ts-expect-error TS(2307): Cannot find module '@/components/Overlay' or its c... Remove this comment to see the full error message
import Overlay from '@/components/Overlay';

// @ts-expect-error TS(2307): Cannot find module '@/components/PasswordInput' or... Remove this comment to see the full error message
import PasswordInput from '@/components/PasswordInput';

// @ts-expect-error TS(2307): Cannot find module '@/utils/email' or its correspo... Remove this comment to see the full error message
import { emailIsValid } from '@/utils/email';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
import styles from './styles.module.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const { user, handleLogin } = useAuth();

  const { handleSuccess, handleError } = useNotification();
  const [sendPasswordReset] = useSendPasswordResetMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
    } catch (err) {
      handleError(err);
    }
  };
  const handleReset = async (e: any) => {
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
      const { from } = location.state || {};
      navigate(from || '/account');
    }
  });

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
            onChange={({ target }) => setEmail(target.value)}
          ></TextField>
          <PasswordInput
            error={error}
            value={password}
            onChange={({
              target
            }: any) => setPassword(target.value)}
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
