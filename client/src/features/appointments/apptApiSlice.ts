import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import { formatDateFull, formatDateToTime } from '../../utils/date';

import { Appointment } from '../../types';
import type { RootState } from '../../app/store';


const appointmentAdapter = createEntityAdapter<Appointment>({
  selectId: (appt) => appt.id,
});

const initialState = appointmentAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppointment: builder.query<EntityState<Appointment>, void>({
      query: () => '/api/appointments',
      transformResponse: (responseData: Appointment[]) => {
        const loadedPosts = responseData
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((appt) => ({
            ...appt,
            start: formatDateToTime(appt.start)
          }));
        return appointmentAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result) =>
        result
          ? [
            ...result.ids.map((id) => ({ type: 'Appointment' as const, id })),
            { type: 'Appointment', id: 'LIST' },
          ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),

    getSingleAppointment: builder.query<Appointment, string>({
      query: (id) => `/api/appointments/${id}`,
      transformResponse: (responseData: Appointment) => {
        return {
          ...responseData,
          start: formatDateToTime(responseData.start),
        };
      },
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),

    addAppointment: builder.mutation<{ success: boolean; message: string }, Partial<Appointment>>({
      query: (appointment) => ({
        url: '/api/appointments',
        method: 'POST',
        body: appointment
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }, 'Schedule'],
    }),

    modifyAppointment: builder.mutation<{ success: boolean; message: string }, Partial<Appointment> & { id: string }>({
      // destructure to separate id from body
      query: ({
        id,
        ...appointment
      }) => ({
        url: `/api/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }, 'Schedule'],
    }),

    updateAppointmentStatus: builder.mutation<{ success: boolean; message: string }, { id: string, status: string }>({
      // destructure to separate id from body
      query: ({
        id,
        ...appointment
      }) => ({
        url: `/api/appointments/status/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }, 'Schedule'],
    }),

    cancelAppointment: builder.mutation<{ success: boolean; message: string }, { id: string }>({
      query: (appointment) => ({
        url: `/api/appointments/${appointment.id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }, 'Schedule'],
    })
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
  (state: RootState) => selectAppointmentData(state) ?? initialState
);
