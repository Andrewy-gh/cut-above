import { apiSlice } from '../../app/api/apiSlice';

export const appointmentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: () => '/appointment',
      keepUnusedDataFor: 5,
      providesTags: ['Appointment'],
    }),
    addAppointment: builder.mutation({
      query: (appointment) => ({
        url: 'appointment',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const { useGetAppointmentsQuery, useAddAppointmentMutation } =
  appointmentSlice;
