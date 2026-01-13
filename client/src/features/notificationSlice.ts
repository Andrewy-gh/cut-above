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

export const { setSuccess, setError, setSeverity, clearMessage } =
  notificationSlice.actions;

export default notificationSlice.reducer;

export const selectOpen = (state) => state.notification.open;
export const selectMessage = (state) => state.notification.message;
export const selectSeverity = (state) => state.notification.severity;
