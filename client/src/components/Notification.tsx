import { forwardRef } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNotification } from "../hooks/useNotification";

const Alert = forwardRef(function Alert(props, ref) {

  // @ts-expect-error TS(2322): Type 'ForwardedRef<unknown>' is not assignable to ... Remove this comment to see the full error message
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification() {
  const { open, message, severity, handleClearMessage } = useNotification();
  return (

    // @ts-expect-error TS(2746): This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClearMessage}>
      // @ts-expect-error TS(2304): Cannot find name 'children'.
      // @ts-expect-error TS(2322): Type '{ children: unknown; onClose: () => any; sev... Remove this comment to see the full error message
      // @ts-expect-error TS(2322): Type '{ children: unknown; onClose: () => any; sev... Remove this comment to see the full error message
      <Alert onClose={handleClearMessage} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
