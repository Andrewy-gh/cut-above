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
  formatDateFull,
} from '../utils/date';

const scheduleAdapter = createEntityAdapter({});

const initialState = scheduleAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getSchedule: builder.query({
      query: () => '/api/schedules',
      transformResponse: (responseData: any) => {
        const loadedPosts = responseData
          // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
          .sort((a: any, b: any) => new Date(a.date) - new Date(b.date))
          .map((s: any) => {
            const appointments = s.appointments.map((appt: any) => ({
              ...appt,
              date: formatDateFull(appt.date)
            }));
            return {
              ...s,
              appointments,
            };
          });
        return scheduleAdapter.setAll(initialState, loadedPosts);
      },
      // keepUnusedDataFor: 5,
      providesTags: ['Schedule'],
    }),

    addSchedule: builder.mutation({
      query: (schedule: any) => ({
        url: '/api/schedules',
        method: 'POST',
        body: schedule
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),

    updateSchedule: builder.mutation({
      query: (schedule: any) => ({
        url: `/api/schedules/${schedule.id}`,
        method: 'PUT',
        body: schedule
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    })
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


// @ts-expect-error TS(2742): The inferred type of 'selectScheduleByDate' cannot... Remove this comment to see the full error message
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

        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        (s) => s.date === date && checkIsBefore(currentDate, s.close) // currentDate holds the hours and minutes, currentDate and s.close are in UTC
      );
    } else {

      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      return schedule.find((s) => s.date === date);
    }
  }
);


// @ts-expect-error TS(2742): The inferred type of 'selectScheduleByFilter' cann... Remove this comment to see the full error message
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
