import { useEffect, useMemo } from 'react';
import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { useMutation, useQuery } from '@/convex/client';
import { api } from '../../../../convex/_generated/api';
import { normalizeAppointment } from '@/utils/date';
import { useAppDispatch } from '@/app/hooks';
import type { RootState } from '@/app/store';
import type { Appointment } from '@/types';

const appointmentAdapter = createEntityAdapter<Appointment>();

const initialState = appointmentAdapter.getInitialState();

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      appointmentAdapter.setAll(state, action.payload);
    },
    upsertAppointment: (state, action: PayloadAction<Appointment>) => {
      appointmentAdapter.upsertOne(state, action.payload);
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      appointmentAdapter.removeOne(state, action.payload);
    },
    clearAppointments: (state) => {
      appointmentAdapter.removeAll(state);
    },
  },
});

export const {
  setAppointments,
  upsertAppointment,
  removeAppointment,
  clearAppointments,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;

export const {
  selectAll: selectAllAppointment,
  selectById: selectAppointmentById,
} = appointmentAdapter.getSelectors(
  (state: RootState) => state.appointments ?? initialState
);

export const useGetAppointmentQuery = () => {
  const dispatch = useAppDispatch();
  const data = useQuery(api.appointments.getAppointments, {});

  const normalized = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((appt) => normalizeAppointment(appt));
  }, [data]);

  useEffect(() => {
    if (data) {
      dispatch(setAppointments(normalized));
    }
  }, [data, dispatch, normalized]);

  return {
    data,
    isLoading: data === undefined,
  };
};

export const useGetSingleAppointmentQuery = (id: string) => {
  const data = useQuery(api.appointments.getAppointmentById, { id });
  const normalized = data ? normalizeAppointment(data) : undefined;

  return {
    data: normalized,
    isLoading: data === undefined,
    isSuccess: Boolean(data),
    isError: false,
  };
};

export const useAddAppointmentMutation = () => {
  const createAppointment = useMutation(api.appointments.createAppointment);

  const trigger = async (appointment: Partial<Appointment>) => {
    return createAppointment({
      start: appointment.start ?? '',
      end: appointment.end ?? '',
      service: appointment.service ?? '',
      employee: {
        id:
          typeof appointment.employee === 'string'
            ? appointment.employee
            : appointment.employee?.id ?? '',
        firstName:
          typeof appointment.employee === 'string'
            ? ''
            : appointment.employee?.firstName ?? '',
      },
    });
  };

  return [trigger] as const;
};

export const useModifyAppointmentMutation = () => {
  const modifyAppointment = useMutation(api.appointments.modifyAppointment);

  const trigger = async (
    appointment: Partial<Appointment> & { id: string }
  ) => {
    return modifyAppointment({
      id: appointment.id,
      start: appointment.start,
      end: appointment.end,
      service: appointment.service,
      employee:
        appointment.employee && typeof appointment.employee !== 'string'
          ? {
              id: appointment.employee.id,
              firstName: appointment.employee.firstName,
            }
          : undefined,
    });
  };

  return [trigger] as const;
};

export const useUpdateAppointmentStatusMutation = () => {
  const updateStatus = useMutation(api.appointments.updateAppointmentStatus);

  const trigger = async (payload: { id: string; status: string }) => {
    return updateStatus(payload);
  };

  return [trigger] as const;
};

export const useCancelAppointmentMutation = () => {
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const trigger = async (payload: { id: string }) => {
    return cancelAppointment(payload);
  };

  return [trigger] as const;
};
