import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRegisterAccountMutation } from '@/features/registerSlice';
import Overlay from '@/components/Overlay';
import { useNotification } from '@/hooks/useNotification';
import { cleanEmail, emailIsValid } from '@/utils/email';
import styles from './styles.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [pwdHelperText, setPwdHelperText] = useState('');
  const [registerAccount] = useRegisterAccountMutation();

  const { handleSuccess, handleError } = useNotification();

  const handlePwdChange = (e) => {
    setPwdError(false);
    setPwdHelperText('');
    setPassword(e.target.value);
  };

  const handleConfirmPwdChange = (e) => {
    setPwdError(false);
    setPwdHelperText('');
    setConfirmPwd(e.target.value);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!emailIsValid(email)) {
        setEmailError(true);
        setEmailHelperText('Invalid email');
        return;
      }
      if (password !== confirmPwd) {
        // set a error message
        setPwdError(true);
        setPwdHelperText('Passwords do not match');
        return;
      }
      setEmail((email) => cleanEmail(email));
      const newUser = await registerAccount({
        firstName,
        lastName,
        email,
        password,
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
              value={firstName}
              onChange={({ target }) => setFirstName(target.value)}
            ></TextField>
            <TextField
              label="Last name"
              margin="normal"
              fullWidth
              value={lastName}
              onChange={({ target }) => setLastName(target.value)}
            ></TextField>
          </div>
          <TextField
            error={emailError}
            helperText={emailHelperText}
            label="Email"
            required
            fullWidth
            value={email}
            onChange={({ target }) => setEmail(target.value)}
          ></TextField>
          <TextField
            error={pwdError}
            label="Password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={password}
            onChange={handlePwdChange}
          ></TextField>
          <TextField
            error={pwdError}
            helperText={pwdHelperText}
            label="Confirm password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={confirmPwd}
            onChange={handleConfirmPwdChange}
          ></TextField>
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
