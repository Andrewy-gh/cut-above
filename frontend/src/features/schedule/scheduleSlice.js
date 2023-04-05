import { apiSlice } from '../../app/api/apiSlice';

export const scheduleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/schedule',
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

export const { useGetScheduleQuery, useAddScheduleMutation } = scheduleSlice;
