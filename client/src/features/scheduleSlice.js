import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../app/api/apiSlice';
import { selectEmployeeIds } from './employeeSlice';
import { selectDate, selectEmployee, selectService } from './filterSlice';
import {
  checkIsBefore,
  convertUtcToEst,
  currentDate,
  findAvailableTimeSlots,
  formatDate,
} from '../utils/date';

const scheduleAdapter = createEntityAdapter({});

const initialState = scheduleAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/api/schedule',
      transformResponse: (responseData) => {
        const loadedPosts = responseData;
        return scheduleAdapter.setAll(initialState, loadedPosts);
      },
      // keepUnusedDataFor: 5,
      providesTags: ['Schedule'],
    }),
    addSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/api/schedule',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: (schedule) => ({
        url: `/api/schedule/${schedule.id}`,
        method: 'PUT',
        body: schedule,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useAddScheduleMutation,
  useUpdateScheduleMutation,
} = extendedApiSlice;

export const selectScheduleResult =
  extendedApiSlice.endpoints.getSchedule.select();

const selectScheduleData = createSelector(
  selectScheduleResult,
  (scheduleResult) => scheduleResult.data
);

export const { selectAll: selectAllSchedule, selectById: selectScheduleById } =
  scheduleAdapter.getSelectors(
    (state) => selectScheduleData(state) ?? initialState
  );

export const selectScheduleByDate = createSelector(
  selectAllSchedule,
  selectDate,
  // selectDateDisabled,
  // add dateDisabled to below
  (schedule, date) => {
    // ! Recent change
    const currentEstTime = convertUtcToEst(currentDate);
    const formattedCurrentDate = formatDate(currentEstTime);
    const inputDate = formatDate(date);
    // ! Recent change
    if (inputDate === formattedCurrentDate) {
      // prevents user from making appointments after closing time if searching for current day appointments
      return schedule.find(
        (s) =>
          formatDate(s.date) === inputDate &&
          checkIsBefore(currentDate, s.close) // currentDate holds the hours and minutes, currentDate and s.close are in UTC
      );
    } else {
      return schedule.find((s) => formatDate(s.date) === inputDate);
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
