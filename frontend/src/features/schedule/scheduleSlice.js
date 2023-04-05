import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import date from '../date/date';

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
    }),
    addSchedule: builder.mutation({
      query: (schedule) => ({
        url: '/schedule',
        method: 'POST',
        body: schedule,
      }),
    }),
  }),
});

export const { useGetScheduleQuery, useAddScheduleMutation } = extendedApiSlice;

export const selectScheduleResult =
  extendedApiSlice.endpoints.getSchedule.select();

const selectScheduleData = createSelector(
  selectScheduleResult,
  (scheduleResult) => scheduleResult.data // normalized state object with ids & entities
);

export const { selectAll: selectAllSchedule, selectById: selectScheduleById } =
  scheduleAdapter.getSelectors(
    (state) => selectScheduleData(state) ?? initialState
  );
