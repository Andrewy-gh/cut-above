import { createSlice } from '@reduxjs/toolkit';
import { getRandomEmployee } from '../utils/employee';
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
    chooseEmployeePref: (state, action) => {
      const availableEmployees = action.payload;
      if (state.employee === 'any') {
        state.employee = getRandomEmployee(availableEmployees);
      } else {
        return state;
      }
    },
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
  chooseEmployeePref,
  setDateDisabled,
  setService,
  setSavedSelections,
  clearSavedSelections,
} = filterSlice.actions;
export default filterSlice.reducer;
