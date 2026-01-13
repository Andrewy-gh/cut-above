import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  //   open, setOpen, message, setMessage, severity, setSeverity
  initialState: { open: false, message: "", severity: "" },
  reducers: {
    setSuccess: (state, action) => {
      state.open = true;
      state.message = action.payload;
      state.severity = "success";
    },
    setError: (state, action) => {
      state.open = true;
      state.message = action.payload;
      state.severity = "error";
    },
    clearMessage: (state) => {
      state.open = false;
      state.message = "";
      state.severity = "success";
    },
  },
});


// @ts-expect-error TS(2339): Property 'setSeverity' does not exist on type 'Cas... Remove this comment to see the full error message
export const { setSuccess, setError, setSeverity, clearMessage } =
  notificationSlice.actions;

export default notificationSlice.reducer;

export const selectOpen = (state: any) => state.notification.open;
export const selectMessage = (state: any) => state.notification.message;
export const selectSeverity = (state: any) => state.notification.severity;
