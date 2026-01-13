import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { useRegisterAccountMutation } from '@/features/auth/authApiSlice';
import PasswordInput from '@/components/PasswordInput';
import Overlay from '@/components/Overlay';
import { useNotification } from '@/hooks/useNotification';
import { cleanEmail, emailIsValid } from '@/utils/email';
import { passwordIsValid, passwordValidationError } from '@/utils/password';
import styles from './styles.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPwd: '',
  });
  const [emailError, setEmailError] = useState({
    error: false,
    helperText: '',
  });
  const [pwdError, setPwdError] = useState({ error: false, helperText: '' });

  const [registerAccount] = useRegisterAccountMutation();

  const { handleSuccess, handleError } = useNotification();

  const handleEmailChange = (e) => {
    setEmailError({ error: false, helperText: '' });
    setUser({ ...user, email: e.target.value });
  };

  const handlePwdChange = (e) => {
    setPwdError({ error: false, helperText: '' });
    setUser({ ...user, password: e.target.value });
  };

  const handleConfirmPwdChange = (e) => {
    setPwdError({ error: false, helperText: '' });
    setUser({ ...user, confirmPwd: e.target.value });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!emailIsValid(user.email)) {
        setEmailError({ error: true, helperText: 'Invalid email' });
        return;
      }
      if (!passwordIsValid(user.password)) {
        setPwdError({
          error: true,
          helperText: passwordValidationError,
        });
        return;
      }
      if (user.password !== user.confirmPwd) {
        setPwdError({ error: true, helperText: 'Passwords do not match' });
        return;
      }
      const newUser = await registerAccount({
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        email: cleanEmail(user.email),
      }).unwrap();
      if (newUser.success) {
        navigate('/login');
        handleSuccess(newUser.message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <Overlay>
      <div className="container-sm">
        <h3 className="text-center">Sign up</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.flex}>
            <TextField
              label="First name"
              margin="normal"
              fullWidth
              value={user.firstName}
              onChange={({ target }) =>
                setUser({ ...user, firstName: target.value })
              }
            ></TextField>
            <TextField
              label="Last name"
              margin="normal"
              fullWidth
              value={user.lastName}
              onChange={({ target }) =>
                setUser({ ...user, lastName: target.value })
              }
            ></TextField>
          </div>
          <TextField
            error={emailError.error}
            helperText={emailError.helperText}
            label="Email"
            required
            fullWidth
            value={user.email}
            onChange={handleEmailChange}
          ></TextField>
          <PasswordInput
            error={pwdError.error}
            value={user.password}
            onChange={handlePwdChange}
            label="Password *"
          />
          {/* Confirm password */}
          <PasswordInput
            error={pwdError.error}
            value={user.confirmPwd}
            onChange={handleConfirmPwdChange}
            label="Confirm Password *"
          />
          {pwdError.error && (
            <FormHelperText error={pwdError.error}>
              {pwdError.helperText}
            </FormHelperText>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Signup
          </Button>
        </form>
      </div>
    </Overlay>
  );
}
