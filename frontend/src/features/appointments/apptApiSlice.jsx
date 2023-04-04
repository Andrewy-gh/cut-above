import { apiSlice } from '../../app/api/apiSlice';

export const apptApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: () => '/appointment',
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useGetAppointmentsQuery } = apptApiSlice;
