import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function ContactUs() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(firstName, lastName, email, message);
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '.625rem',
        marginTop: '.5rem',
        padding: '1rem',
      }}
    >
      <h3 style={{ mb: 2 }}>Contact us</h3>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <TextField
            label="First name"
            margin="normal"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          ></TextField>

          <TextField
            label="Last name"
            margin="normal"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          ></TextField>
        </div>
        <TextField
          label="Email"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></TextField>
        <TextField
          label="Message"
          required
          fullWidth
          margin="normal"
          multiline
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></TextField>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, mb: 3 }}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}
