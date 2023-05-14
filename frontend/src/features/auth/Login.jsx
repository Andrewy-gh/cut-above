import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import { setError, setSuccess } from '../notification/notificationSlice';
import { useSelector } from 'react-redux';
import { selectHoldStatus } from '../filter/filterSlice';

// TODO useEffect navigate to profile?
const Login = () => {
  const holding = useSelector(selectHoldStatus);
  const [user, setUser] = useState('admin@cutabove.com');
  const [password, setPassword] = useState('pw');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({
        email: user.toLowerCase(),
        password,
      }).unwrap();
      console.log('userData', userData);
      dispatch(
        setCredentials({
          user: userData.user,
          accessToken: userData.accessToken,
        })
      );
      setUser('');
      setPassword('');
      dispatch(setSuccess('Successfully logged in'));
      if (holding) {
        navigate('/reserve');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
      dispatch(setError(`Error logging in: ${error.error}`));
    }
  };

  const handleUserInput = (e) => setUser(e.target.value);
  const handlePwdChange = (e) => setPassword(e.target.value);
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px',
          mt: '8px',
          padding: 2,
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Log In
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            required
            fullWidth
            margin="normal"
            value={user}
            onChange={handleUserInput}
          ></TextField>
          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={password}
            onChange={handlePwdChange}
          ></TextField>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Submit
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                Already have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
