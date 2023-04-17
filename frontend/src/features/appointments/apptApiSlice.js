import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import date from '../date/date';

const appointmentAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

const initialState = appointmentAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointment: builder.query({
      query: () => '/appointment',
      transformResponse: (responseData) => {
        const loadedPosts = responseData.map((appt) => ({
          ...appt,
          date: date.dateSlash(appt.date),
          time: date.time(appt.time),
        }));
        return appointmentAdapter.setAll(initialState, loadedPosts);
      },
      // keepUnusedDataFor: 5,
      providesTags: ['Appointment'],
    }),
    addAppointment: builder.mutation({
      query: (appointment) => ({
        url: '/appointment',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),
    cancelAppointment: builder.mutation({
      query: (appointment) => ({
        url: `/appointment/${appointment.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAppointmentQuery,
  useAddAppointmentMutation,
  useCancelAppointmentMutation,
} = extendedApiSlice;

export const selectAppointmentResult =
  extendedApiSlice.endpoints.getAppointment.select();

const selectAppointmentData = createSelector(
  selectAppointmentResult,
  (AppointmentResult) => AppointmentResult.data
);

export const {
  selectAll: selectAllAppointment,
  selectById: selectAppointmentById,
} = appointmentAdapter.getSelectors(
  (state) => selectAppointmentData(state) ?? initialState
);
