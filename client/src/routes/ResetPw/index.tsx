import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import PasswordInput from '@/components/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { passwordIsValid, passwordValidationError } from '@/utils/password';

// This is the Reset Password page when accessed through email
export default function ResetPw() {
  const { token, id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    password: '',
    confirmPwd: '',
  });
  const [pwdError, setPwdError] = useState({ error: false, helperText: '' });
  const { handleUserPasswordReset } = useAuth();

  if (!id) {
    throw new Error('no id');
  }
  if (!token) {
    throw new Error('no token');
  }

  const handlePwdChange = (e) => {
    setPwdError({ error: false, helperText: '' });
    setUser({ ...user, password: e.target.value });
  };

  const handleConfirmPwdChange = (e) => {
    setPwdError({ error: false, helperText: '' });
    setUser({ ...user, confirmPwd: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    await handleUserPasswordReset({
      id,
      token,
      password: user.password,
    });
    navigate('/login');
  };

  return (
    <div className="container-sm">
      <h3 className="text-center">Reset password</h3>
      <form onSubmit={handleSubmit}>
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
          Change Password
        </Button>
      </form>
    </div>
  );
}
