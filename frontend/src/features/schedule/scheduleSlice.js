import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import {
  selectDate,
  selectDateDisabled,
  selectEmployee,
} from '../filter/filterSlice';
import dateServices from '../date/date';

const scheduleAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

const initialState = scheduleAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/schedule',
      transformResponse: (responseData) => {
        return scheduleAdapter.setAll(initialState, responseData);
      },
      keepUnusedDataFor: 5,
      providesTags: ['Schedule'],
    }),
    addSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/schedule',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: (schedule) => ({
        url: `/schedule/${schedule.id}`,
        method: 'PUT',
        body: schedule,
      }),
      invalidatesTags: ['Schedule'],
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
  (scheduleResult) => scheduleResult.data // normalized state object with ids & entities
);

export const {
  selectAll: selectAllSchedule,
  selectById: selectScheduleById,
  selectIds,
} = scheduleAdapter.getSelectors(
  (state) => selectScheduleData(state) ?? initialState
);

export const selectScheduleByFilter = createSelector(
  selectAllSchedule,
  selectDate,
  selectEmployee,
  (schedule, date, employee) => {
    return date && employee !== 'any'
      ? schedule.filter(
          (s) =>
            dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date) &&
            s.employee === employee
        )
      : date
      ? schedule.filter(
          (s) =>
            dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date)
        )
      : employee !== 'any'
      ? schedule.filter((s) => s.employee === employee)
      : schedule;
  }
);

// export const selectScheduleByFilter = createSelector(
//   selectAllSchedule,
//   selectDate,
//   selectDateDisabled,
//   selectEmployee,
//   (schedule, date, dateDisabled, employee) => {
//     return !dateDisabled && employee !== 'any'
//       ? schedule.filter(
//           (s) =>
//             dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date) &&
//             s.employee === employee
//         )
//       : !dateDisabled && employee === 'any'
//       ? schedule.filter(
//           (s) =>
//             dateServices.dateHyphen(s.date) === dateServices.dateHyphen(date)
//         )
//       : dateDisabled && employee !== 'any'
//       ? schedule.filter((s) => s.employee === employee)
//       : schedule;
//   }
// );
