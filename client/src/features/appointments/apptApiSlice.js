import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import { formatDateFull, formatDateToTime } from '../../utils/date';

const appointmentAdapter = createEntityAdapter({});

const initialState = appointmentAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointment: builder.query({
      query: () => '/api/appointment',
      transformResponse: (responseData) => {
        const loadedPosts = responseData
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((appt) => ({
            ...appt,
            date: formatDateFull(appt.date),
            start: formatDateToTime(appt.start),
          }));
        return appointmentAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: ['Appointment'],
    }),
    getSingleAppointment: builder.query({
      query: (id) => `/api/appointment/${id}`,
      transformResponse: (responseData) => {
        return {
          ...responseData,
          date: formatDateFull(responseData.date),
          start: formatDateToTime(responseData.start),
        };
      },
      providesTags: ['Appointment'],
    }),
    addAppointment: builder.mutation({
      query: (appointment) => ({
        url: '/api/appointment',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
    modifyAppointment: builder.mutation({
      query: (appointment) => ({
        url: `/api/appointment/${appointment.id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
    updateAppointmentStatus: builder.mutation({
      query: (appointment) => ({
        url: `/api/appointment/status/${appointment.id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
    cancelAppointment: builder.mutation({
      query: (appointment) => ({
        url: `/api/appointment/${appointment.id}`,
        method: 'DELETE',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'Schedule'],
    }),
  }),
});

export const {
  useGetAppointmentQuery,
  useGetSingleAppointmentQuery,
  useAddAppointmentMutation,
  useModifyAppointmentMutation,
  useUpdateAppointmentStatusMutation,
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
