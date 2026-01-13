import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// @ts-expect-error TS(2307): Cannot find module '@/features/emailSlice' or its ... Remove this comment to see the full error message
import { useSendMessageResponseMutation } from '@/features/emailSlice';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useNotification' or it... Remove this comment to see the full error message
import { useNotification } from '@/hooks/useNotification';

// @ts-expect-error TS(2307): Cannot find module '@/utils/email' or its correspo... Remove this comment to see the full error message
import { emailIsValid } from '@/utils/email';

// @ts-expect-error TS(2307): Cannot find module './styles.module.css' or its co... Remove this comment to see the full error message
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

  const handleEmailChange = (e: any) => {
    setEmailError({
      error: false,
      helperText: '',
    });
    setContact({ ...contact, email: e.target.value });
  };

  const { handleSuccess, handleError } = useNotification();
  const [sendMessageResponse] = useSendMessageResponseMutation();

  const handleSubmit = async (e: any) => {
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
      // @ts-expect-error TS(2304): Cannot find name 'mb'.
      // @ts-expect-error TS(2322): Type '{ mb: number; }' is not assignable to type '... Remove this comment to see the full error message
      // @ts-expect-error TS(2322): Type '{ mb: number; }' is not assignable to type '... Remove this comment to see the full error message
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
