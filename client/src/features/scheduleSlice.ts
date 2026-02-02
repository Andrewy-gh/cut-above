import {
  createSelector,
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { selectEmployeeIds } from './employeeSlice';
import { selectDate, selectEmployee, selectService } from './filterSlice';
import type { RootState } from '../app/store';
import {
  checkIsBefore,
  convertUtcToEst,
  currentDate,
  findAvailableTimeSlots,
  formatDate,
} from '../utils/date';
import { Schedule } from '../types';

const scheduleAdapter = createEntityAdapter<Schedule>();

const initialState = scheduleAdapter.getInitialState();

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    setSchedules: (state, action: PayloadAction<Schedule[]>) => {
      scheduleAdapter.setAll(state, action.payload);
    },
    clearSchedules: (state) => {
      scheduleAdapter.removeAll(state);
    },
  },
});

export const { setSchedules, clearSchedules } = scheduleSlice.actions;
export default scheduleSlice.reducer;

export const { selectAll: selectAllSchedule, selectById: selectScheduleById } =
  scheduleAdapter.getSelectors(
    (state: RootState) => state.schedules ?? initialState
  );


export const selectScheduleByDate = createSelector(
  selectAllSchedule,
  selectDate,
  // selectDateDisabled,
  // add dateDisabled to below
  (schedule, date) => {
    const currentEstTime = convertUtcToEst(currentDate);
    const formattedCurrentDate = formatDate(currentEstTime);
    const inputDate = formatDate(date);
    if (inputDate === formattedCurrentDate) {
      // prevents user from making appointments after closing time if searching for current day appointments
      return schedule.find(
        (s) => formatDate(s.open) === date && checkIsBefore(currentDate, s.close) // currentDate holds the hours and minutes, currentDate and s.close are in UTC
      );
    } else {
      return schedule.find((s) => formatDate(s.open) === date);
    }
  }
);


export const selectScheduleByFilter = createSelector(
  selectScheduleByDate,
  selectService,
  selectEmployeeIds,
  selectEmployee,
  (schedule, service, employees, employee) => {
    if (!schedule) {
      return [];
    }
    const availableTimeSlots = findAvailableTimeSlots(
      schedule,
      service.duration,
      employees,
      employee
    );
    return availableTimeSlots;
  }
);
