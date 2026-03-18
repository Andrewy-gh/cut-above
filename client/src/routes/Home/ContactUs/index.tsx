import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useMutation } from '@/convex/client';
import { api } from '../../../../../convex/_generated/api';

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError({
      error: false,
      helperText: '',
    });
    setContact({ ...contact, email: e.target.value });
  };

  const { handleSuccess, handleError } = useNotification();
  const sendMessage = useMutation(api.email.sendMessage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!emailIsValid(contact.email)) {
        setEmailError({ error: true, helperText: 'invalid email' });
        return;
      }
      const sentMessageResponse = await sendMessage({
        contactDetails: contact,
      });
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
      <h3 className={styles.contact_heading}>Contact us</h3>
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
