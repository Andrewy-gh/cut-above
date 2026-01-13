import { createSlice } from '@reduxjs/toolkit';
import { initialCurrentDate } from '../utils/date';

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    date: initialCurrentDate,
    dateDisabled: false,
    employee: 'any',
    holdStatus: false,
    service: { id: 1, name: 'Haircut', duration: 30 },
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
    // ! TODO: implement these if user has selected slots but has not logged in
    setSavedSelections: (state, action) => {
      const { slot, employee } = action.payload;
      state.holdStatus = true;
      state.savedSelections = { slot, employee };
    },
    clearSavedSelections: (state) => {
      state.holdStatus = false;
      state.savedSelections = {
        slot: null,
        employee: null,
      };
    },
    resetFilter: (state) => {
      state.date = initialCurrentDate;
      state.employee = 'any';
      state.service = { id: 1, name: 'Haircut', duration: 30 };
    },
  },
});

export const selectDate = (state: any) => state.filter.date;
export const selectDateDisabled = (state: any) => state.filter.dateDisabled;
export const selectEmployee = (state: any) => state.filter.employee;
export const selectService = (state: any) => state.filter.service;
export const seklectHoldStatus = (state: any) => state.filter.holdStatus;
export const selectSavedSelections = (state: any) => state.filter.savedSelections;
export const {
  setDate,
  setEmployee,

  // @ts-expect-error TS(2339): Property 'chooseEmployeePref' does not exist on ty... Remove this comment to see the full error message
  chooseEmployeePref,
  setDateDisabled,
  setService,
  setSavedSelections,
  clearSavedSelections,
  resetFilter,
} = filterSlice.actions;
export default filterSlice.reducer;
