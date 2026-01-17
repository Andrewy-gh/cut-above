import { createSlice } from '@reduxjs/toolkit';
import { initialCurrentDate } from '../utils/date';
import type { RootState } from '../app/store';
import type { Employee } from './employeeSlice';

interface FilterState {
  date: string;
  dateDisabled: boolean;
  employee: Employee | undefined;
  holdStatus: boolean;
  service: { id: number; name: string; duration: number };
  savedSelections: {
    slot: null;
    employee: null;
  };
}

const initialState: FilterState = {
  date: initialCurrentDate,
  dateDisabled: false,
  employee: undefined,
  holdStatus: false,
  service: { id: 1, name: 'Haircut', duration: 30 },
  savedSelections: {
    slot: null,
    employee: null,
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
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
      state.employee = undefined;
      state.service = { id: 1, name: 'Haircut', duration: 30 };
    },
  },
});

export const selectDate = (state: RootState) => state.filter.date;
export const selectDateDisabled = (state: RootState) => state.filter.dateDisabled;
export const selectEmployee = (state: RootState) => state.filter.employee;
export const selectService = (state: RootState) => state.filter.service;
export const seklectHoldStatus = (state: RootState) => state.filter.holdStatus;
export const selectSavedSelections = (state: RootState) => state.filter.savedSelections;
export const {
  setDate,
  setEmployee,
  setDateDisabled,
  setService,
  setSavedSelections,
  clearSavedSelections,
  resetFilter,
} = filterSlice.actions;
export default filterSlice.reducer;
