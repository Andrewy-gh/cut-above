import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

// TODO validate email
const ContactUs = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(firstName, lastName, email, message);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <Container component="main" maxWidth="md">
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
            Contact us
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
              margin="normal"
              value={email}
              onChange={handleEmailChange}
            ></TextField>
            <TextField
              label="Message"
              required
              fullWidth
              margin="normal"
              multiline
              value={message}
              onChange={handleMessageChange}
            ></TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, mb: 3 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </Container>
  );
};
export default ContactUs;
