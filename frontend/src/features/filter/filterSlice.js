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
    holdStatus: false,
    service: 'Haircut',
    savedSelections: {
      slot: null,
      employee: null,
    },
  },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
    setDateDisabled: (state, action) => {
      state.dateDisabled = action.payload;
    },
    setService: (state, action) => {
      state.service = action.payload;
    },
    setEmployee: (state, action) => {
      state.employee = action.payload;
    },
    setSavedSelections: (state, action) => {
      const { slot, employee } = action.payload;
      state.holdStatus = true;
      state.savedSelections = { slot, employee };
    },
    clearSavedSelections: (state, action) => {
      state.holdStatus = false;
      state.savedSelections = {
        slot: null,
        employee: null,
      };
    },
  },
});

export const selectDate = (state) => state.filter.date;
export const selectDateDisabled = (state) => state.filter.dateDisabled;
export const selectEmployee = (state) => state.filter.employee;
export const selectService = (state) => state.filter.service;
export const selectHoldStatus = (state) => state.filter.holdStatus;
export const selectSavedSelections = (state) => state.filter.savedSelections;
export const {
  setDate,
  setEmployee,
  setDateDisabled,
  setService,
  setSavedSelections,
  clearSavedSelections,
} = filterSlice.actions;
export default filterSlice.reducer;
