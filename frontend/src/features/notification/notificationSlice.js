import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { open: false, alert: '', severity: '' },
  reducers: {
    setSuccess: (state, action) => {
      state.open = true;
      state.alert = action.payload;
      state.severity = 'success';
    },
    setError: (state, action) => {
      state.open = true;
      state.alert = action.payload;
      state.severity = 'error';
    },
    clearAlert: (state, action) => {
      state.open = false;
      state.alert = '';
    },
  },
});

export const { setSuccess, setError, setSeverity, clearAlert } =
  notificationSlice.actions;

export default notificationSlice.reducer;

export const selectOpen = (state) => state.notification.open;
export const selectAlert = (state) => state.notification.alert;
export const selectSeverity = (state) => state.notification.severity;
