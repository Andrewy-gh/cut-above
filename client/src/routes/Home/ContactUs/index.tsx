import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useSendMessageResponseMutation } from '@/features/emailSlice';
import { useNotification } from '@/hooks/useNotification';
import { emailIsValid } from '@/utils/email';
import styles from './styles.module.css';

export default function ContactUs() {
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [emailError, setEmailError] = useState({
    error: false,
    helperText: '',
  });

  const handleEmailChange = (e) => {
    setEmailError({
      error: false,
      helperText: '',
    });
    setContact({ ...contact, email: e.target.value });
  };

  const { handleSuccess, handleError } = useNotification();
  const [sendMessageResponse] = useSendMessageResponseMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!emailIsValid(contact.email)) {
        setEmailError({ error: true, helperText: 'invalid email' });
        return;
      }
      const sentMessageResponse = await sendMessageResponse({
        contactDetails: contact,
      }).unwrap();
      if (sentMessageResponse.success) {
        handleSuccess(sentMessageResponse.message);
        setContact({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        });
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
            value={contact.firstName}
            onChange={(e) =>
              setContact({ ...contact, firstName: e.target.value })
            }
          ></TextField>

          <TextField
            label="Last name"
            margin="normal"
            fullWidth
            value={contact.lastName}
            onChange={(e) =>
              setContact({ ...contact, lastName: e.target.value })
            }
          ></TextField>
        </div>
        <TextField
          error={emailError.error}
          helperText={emailError.helperText}
          label="Email"
          required
          fullWidth
          margin="normal"
          value={contact.email}
          onChange={handleEmailChange}
        ></TextField>
        <TextField
          label="Message"
          required
          fullWidth
          margin="normal"
          multiline
          value={contact.message}
          onChange={(e) => setContact({ ...contact, message: e.target.value })}
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
