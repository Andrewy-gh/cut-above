import { apiSlice } from '../../app/api/apiSlice';

export const scheduleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchedule: builder.query({
      query: () => '/schedule',
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetScheduleQuery } = scheduleSlice;
