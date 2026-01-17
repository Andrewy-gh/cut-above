import { createSlice } from "@reduxjs/toolkit";

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const initialState: NotificationState = {
  open: false,
  message: "",
  severity: "success",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
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

export const { setSuccess, setError, clearMessage } =
  notificationSlice.actions;

export default notificationSlice.reducer;

export const selectOpen = (state: { notification: NotificationState }) => state.notification.open;
export const selectMessage = (state: { notification: NotificationState }) => state.notification.message;
export const selectSeverity = (state: { notification: NotificationState }) => state.notification.severity;
