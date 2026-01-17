import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState: { rescheduling: false, modifyingApptId: null },
  reducers: {
    beginRescheduling(state, action) {
      state.rescheduling = true;
      state.modifyingApptId = action.payload;
    },
    endRescheduling(state) {
      state.rescheduling = false;
      state.modifyingApptId = null;
    },
  },
});

export const { beginRescheduling, endRescheduling } = appointmentSlice.actions;

export default appointmentSlice.reducer;

export const selectRescheduling = (state: RootState) => state.appointment.rescheduling;
export const selectModifyingApptId = (state: RootState) => state.appointment.modifyingApptId;
