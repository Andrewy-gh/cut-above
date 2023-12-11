import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useSendMessageResponseMutation } from '@/features/emailSlice';
import { useNotification } from '@/hooks/useNotification';
import { emailIsValid } from '@/utils/email';
import styles from './styles.module.css';

export default function ContactUs() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const { handleSuccess, handleError } = useNotification();
  const [sendMessageResponse] = useSendMessageResponseMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const contactDetails = { firstName, lastName, email, message };
    try {
      if (!emailIsValid(email)) {
        setError(true);
        setHelperText('invalid email');
        return;
      }
      const sentMessageResponse = await sendMessageResponse({
        contactDetails,
      }).unwrap();
      if (sentMessageResponse.success) {
        handleSuccess(sentMessageResponse.message);
        setFirstName('');
        setLastName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className={styles.flex_container}>
      <h3 style={{ mb: 2 }}>Contact us</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.spacing}>
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
          error={error}
          helperText={helperText}
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
