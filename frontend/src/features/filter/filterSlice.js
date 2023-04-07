import { createSlice } from '@reduxjs/toolkit';
import date from '../date/date';
import dayjs from 'dayjs';

const currentDate = new Date().toISOString();

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    date: currentDate,
    dateDisabled: false,
    employee: 'any',
  },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setDateDisabled: (state, action) => {
      state.dateDisabled = action.payload;
    },
    setEmployee: (state, action) => {
      state.employee = action.payload;
    },
  },
});

export const selectDate = (state) => state.filter.date;
export const selectDateDisabled = (state) => state.filter.dateDisabled;
export const selectEmployee = (state) => state.filter.employee;
export const { setDate, setEmployee, setDateDisabled } = filterSlice.actions;
export default filterSlice.reducer;
