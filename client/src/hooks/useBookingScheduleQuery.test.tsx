import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import appointmentsReducer from '@/features/appointments/apptApiSlice';
import appointmentReducer from '@/features/appointments/appointmentSlice';
import authReducer from '@/features/auth/authSlice';
import employeesReducer from '@/features/employeeSlice';
import filterReducer from '@/features/filterSlice';
import notificationReducer from '@/features/notificationSlice';

import { useBookingAvailabilityQuery } from './useBookingAvailabilityQuery';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@/convex/client', () => ({
  useQuery: (...args: unknown[]) => mocks.useQuery(...args),
}));

const createStore = () =>
  configureStore({
    reducer: combineReducers({
      appointment: appointmentReducer,
      appointments: appointmentsReducer,
      auth: authReducer,
      employees: employeesReducer,
      filter: filterReducer,
      notification: notificationReducer,
    }),
    preloadedState: {
      employees: {
        ids: ['employee-1'],
        entities: {
          'employee-1': {
            id: 'employee-1',
            firstName: 'Pat',
          },
        },
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

describe('useBookingAvailabilityQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives available booking slots directly from the queried availability response', () => {
    mocks.useQuery.mockReturnValue({
      schedule: {
        id: 'schedule-1',
        date: '2099-03-18',
        open: '2099-03-18T14:00:00.000Z',
        close: '2099-03-18T16:00:00.000Z',
      },
      slots: [
        {
          id: 'slot-1',
          start: '2099-03-18T14:30:00.000Z',
          end: '2099-03-18T15:00:00.000Z',
          available: ['employee-1'],
        },
      ],
    });

    const store = createStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => useBookingAvailabilityQuery('2099-03-18', 30, 'employee-1'),
      { wrapper }
    );

    expect(result.current.schedule?.date).toBe('2099-03-18');
    expect(result.current.timeSlots).not.toHaveLength(0);
    expect(result.current.timeSlots[0].start.format('HH:mm')).toBe('14:30');
  });
});
