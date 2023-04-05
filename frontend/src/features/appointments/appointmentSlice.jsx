import { apiSlice } from '../../app/api/apiSlice';

export const appointmentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: () => '/appointment',
      keepUnusedDataFor: 5,
    }),
    addAppointment: builder.mutation({
      query: (appointment) => ({
        url: 'appointment',
        method: 'POST',
        body: appointment,
      }),
    }),
  }),
});

export const { useGetAppointmentsQuery, useAddAppointmentMutation } =
  appointmentSlice;
