import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRegisterAccountMutation } from './registerSlice';
import { roles } from '../../data';

// TODO: Register Account
const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [registerAccount] = useRegisterAccountMutation();

  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePwdChange = (e) => setPassword(e.target.value);
  const handleConfirmPwdChange = (e) => setConfirmPwd(e.target.value);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (password !== confirmPwd) {
        // set a error message
        return;
      }
      setEmail((email) => {
        const trimmedEmail = email.trim();
        const lowercaseEmail = trimmedEmail.toLowerCase();
        return lowercaseEmail;
      });
      console.log(firstName, lastName, email);
    } catch (error) {
      console.error('Error registering account: ', error);
    }
  };

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
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={6}>
              <TextField
                label="First name"
                margin="normal"
                fullWidth
                value={firstName}
                onChange={handleFirstNameChange}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last name"
                margin="normal"
                fullWidth
                value={lastName}
                onChange={handleLastNameChange}
              ></TextField>
            </Grid>
          </Grid>

          <TextField
            label="Email"
            required
            fullWidth
            value={email}
            onChange={handleEmailChange}
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
          <TextField
            label="Confirm password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={confirmPwd}
            onChange={handleConfirmPwdChange}
          ></TextField>

          <FormControl
            fullWidth
            margin="normal"
            onChange={(e) => setRole(e.target.value)}
          >
            <InputLabel>Role</InputLabel>
            <Select value={role} label="role">
              <MenuItem value="">Select a role</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.data}>
                  {role.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Register
          </Button>
          <Grid container>
            <Box sx={{ flexGrow: 1 }} />
            <Grid item>
              <Link href="#" variant="body2">
                {'Already have an account? Login'}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};
export default Register;
